'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Invite, InviteStatus } from '../../domain/entities/InviteEntry';
import type { InviteResponse } from '@/api/endpoints/invite';
import { getInvitesApi, resendInviteApi, expireInviteApi } from '@/api/endpoints/invite';
import type { ApiError } from '@/shared/types/api';
import { extractApiError } from '@/shared/utils/api';

/**
 * API 응답(snake_case) → 프론트엔드 엔티티(camelCase) 변환
 */
function toInvite(response: InviteResponse): Invite {
    return {
        inviteId: response.invite_id,
        siteId: response.site_id,
        siteName: response.site_name,
        email: response.email,
        role: response.role,
        status: response.status,
        expiresAt: response.expires_at,
        createdAt: response.created_at,
    };
}

interface UseInvitesReturn {
    invites: Invite[];
    isLoading: boolean;
    /** 현재 mutation 진행 중인 초대 ID 목록 */
    mutatingInviteIds: Set<number>;
    error: ApiError | null;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    statusFilter: InviteStatus | 'ALL';
    setStatusFilter: (status: InviteStatus | 'ALL') => void;
    filteredInvites: Invite[];
    resendInvite: (inviteId: number) => Promise<void>;
    expireInvite: (inviteId: number) => Promise<void>;
    refetchInvites: () => Promise<void>;
}

/**
 * useInvites - 초대 목록 조회/재발송/만료 처리 훅 (API 연동)
 *
 * - PLATFORM_ADMIN 전용
 * - 클라이언트 사이드 검색/필터링 (서버 페이지네이션 미지원)
 * - 동시 mutation 지원 (Set 기반 per-invite 추적)
 */
export function useInvites(): UseInvitesReturn {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mutatingInviteIds, setMutatingInviteIds] = useState<Set<number>>(new Set());
    const [error, setError] = useState<ApiError | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<InviteStatus | 'ALL'>('ALL');

    /** mutation 시작: Set에 inviteId 추가 */
    const addMutating = useCallback((inviteId: number) => {
        setMutatingInviteIds((prev) => new Set(prev).add(inviteId));
    }, []);

    /** mutation 종료: Set에서 inviteId 제거 */
    const removeMutating = useCallback((inviteId: number) => {
        setMutatingInviteIds((prev) => {
            const next = new Set(prev);
            next.delete(inviteId);
            return next;
        });
    }, []);

    /** 초대 목록 조회 */
    const fetchInvites = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getInvitesApi();

            if (response.success) {
                setInvites(response.data.map(toInvite));
            } else {
                setError({
                    code: response.error?.code ?? 'INTERNAL_ERROR',
                    message: response.error?.message ?? '초대 목록 조회에 실패했습니다.',
                });
            }
        } catch (err) {
            setError(extractApiError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvites();
    }, [fetchInvites]);

    /** 클라이언트 사이드 검색/필터링 (메모이제이션) */
    const filteredInvites = useMemo(() => {
        return invites.filter((invite) => {
            const matchesSearch =
                searchTerm === '' ||
                invite.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invite.siteName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === 'ALL' || invite.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [invites, searchTerm, statusFilter]);

    /** 초대 재발송 (PENDING 상태만 가능) */
    const resendInvite = useCallback(async (inviteId: number) => {
        addMutating(inviteId);
        setError(null);

        try {
            const response = await resendInviteApi(inviteId);

            if (response.success) {
                setInvites((prev) =>
                    prev.map((invite) =>
                        invite.inviteId === inviteId ? toInvite(response.data) : invite,
                    ),
                );
            } else {
                setError({
                    code: response.error?.code ?? 'INTERNAL_ERROR',
                    message: response.error?.message ?? '초대 재발송에 실패했습니다.',
                });
            }
        } catch (err) {
            setError(extractApiError(err));
        } finally {
            removeMutating(inviteId);
        }
    }, [addMutating, removeMutating]);

    /** 초대 만료 처리 (PENDING 상태만 가능) */
    const expireInvite = useCallback(async (inviteId: number) => {
        addMutating(inviteId);
        setError(null);

        try {
            const response = await expireInviteApi(inviteId);

            if (response.success) {
                /** 즉시 로컬 상태 반영 (낙관적 업데이트) */
                setInvites((prev) =>
                    prev.map((invite) =>
                        invite.inviteId === inviteId
                            ? { ...invite, status: 'EXPIRED' as InviteStatus }
                            : invite,
                    ),
                );
                /** 서버와 전체 동기화 (실패해도 로컬 상태는 이미 반영) */
                await fetchInvites().catch(() => { /* 로컬 상태로 유지 */ });
            } else {
                setError({
                    code: response.error?.code ?? 'INTERNAL_ERROR',
                    message: response.error?.message ?? '초대 철회에 실패했습니다.',
                });
            }
        } catch (err) {
            setError(extractApiError(err));
        } finally {
            removeMutating(inviteId);
        }
    }, [addMutating, removeMutating, fetchInvites]);

    return {
        invites,
        isLoading,
        mutatingInviteIds,
        error,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        filteredInvites,
        resendInvite,
        expireInvite,
        refetchInvites: fetchInvites,
    };
}
