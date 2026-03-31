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
    /** 현재 mutation 진행 중인 초대 ID (null이면 진행 중 없음) */
    mutatingInviteId: number | null;
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
 */
export function useInvites(): UseInvitesReturn {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mutatingInviteId, setMutatingInviteId] = useState<number | null>(null);
    const [error, setError] = useState<ApiError | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<InviteStatus | 'ALL'>('ALL');

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
        setMutatingInviteId(inviteId);
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
                const apiError: ApiError = {
                    code: response.error?.code ?? 'INTERNAL_ERROR',
                    message: response.error?.message ?? '초대 재발송에 실패했습니다.',
                };
                setError(apiError);
                throw new Error(apiError.message);
            }
        } catch (err) {
            setError(extractApiError(err));
            throw err;
        } finally {
            setMutatingInviteId(null);
        }
    }, []);

    /** 초대 만료 처리 (PENDING 상태만 가능) */
    const expireInvite = useCallback(async (inviteId: number) => {
        setMutatingInviteId(inviteId);
        setError(null);

        try {
            const response = await expireInviteApi(inviteId);

            if (response.success) {
                await fetchInvites();
            } else {
                const apiError: ApiError = {
                    code: response.error?.code ?? 'INTERNAL_ERROR',
                    message: response.error?.message ?? '초대 철회에 실패했습니다.',
                };
                setError(apiError);
                throw new Error(apiError.message);
            }
        } catch (err) {
            setError(extractApiError(err));
            throw err;
        } finally {
            setMutatingInviteId(null);
        }
    }, [fetchInvites]);

    return {
        invites,
        isLoading,
        mutatingInviteId,
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
