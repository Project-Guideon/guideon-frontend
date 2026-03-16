'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Site, SiteInvite, SiteWithInvites, CreateSiteRequest, UpdateSiteRequest } from '@/features/site/domain/entities/Site';
import {
    getSitesApi,
    createSiteApi,
    updateSiteApi,
    activateSiteApi,
    deactivateSiteApi,
    createInviteApi,
    getInvitesApi,
} from '@/api/endpoints/site';
import type { SiteResponse, InviteResponse } from '@/api/endpoints/site';

/**
 * 관광지 필터 상태
 */
interface SiteFilter {
    searchTerm: string;
    activeStatus: 'all' | 'active' | 'inactive';
}

const PAGE_SIZE = 5;

/**
 * API 응답 → 도메인 엔티티 변환
 */
function toSite(response: SiteResponse): Site {
    return {
        siteId: response.siteId,
        name: response.name,
        isActive: response.isActive,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
    };
}

function toInvite(response: InviteResponse): SiteInvite {
    return {
        inviteId: response.invite_id,
        siteId: response.site_id,
        email: response.email,
        status: response.status,
        createdAt: response.created_at,
    };
}

/**
 * useSites — 관광지 데이터 CRUD 및 필터 관리 훅 (API 연동)
 */
export function useSites() {
    const [sites, setSites] = useState<Site[]>([]);
    const [invites, setInvites] = useState<SiteInvite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<SiteFilter>({
        searchTerm: '',
        activeStatus: 'all',
    });
    const [page, setPage] = useState(0);

    // ───────────── 데이터 로드 ─────────────

    const fetchSites = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getSitesApi({ size: 1000 });
            setSites(response.data.items.map(toSite));
        } catch {
            setError('관광지 목록을 불러오는 데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchInvites = useCallback(async () => {
        try {
            const response = await getInvitesApi();
            setInvites(response.data.map(toInvite));
        } catch {
            // 초대 목록 실패는 무시 (핵심 기능 아님)
        }
    }, []);

    useEffect(() => {
        fetchSites();
        fetchInvites();
    }, [fetchSites, fetchInvites]);

    // ───────────── 필터링 ─────────────

    const filteredSites = useMemo(() => {
        return sites.filter((site) => {
            if (filter.searchTerm) {
                const term = filter.searchTerm.toLowerCase();
                if (!site.name.toLowerCase().includes(term)) return false;
            }
            if (filter.activeStatus === 'active' && !site.isActive) return false;
            if (filter.activeStatus === 'inactive' && site.isActive) return false;
            return true;
        });
    }, [sites, filter]);

    // ───────────── 페이지네이션 ─────────────

    const totalPages = Math.ceil(filteredSites.length / PAGE_SIZE);

    const paginatedSites = useMemo(() => {
        const start = page * PAGE_SIZE;
        return filteredSites.slice(start, start + PAGE_SIZE);
    }, [filteredSites, page]);

    // ───────────── CRUD 액션 ─────────────

    /** 관광지 생성 */
    const createSite = useCallback(async (request: CreateSiteRequest) => {
        try {
            const response = await createSiteApi({ name: request.name });
            setSites((previous) => [toSite(response.data), ...previous]);
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { error?: { message?: string } } } };
            setError(apiError.response?.data?.error?.message ?? '관광지 생성에 실패했습니다.');
        }
    }, []);

    /** 관광지 수정 */
    const updateSite = useCallback(async (siteId: number, request: UpdateSiteRequest) => {
        try {
            const response = await updateSiteApi(siteId, { name: request.name });
            const updated = toSite(response.data);
            setSites((previous) =>
                previous.map((site) => site.siteId === siteId ? updated : site),
            );
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { error?: { message?: string } } } };
            setError(apiError.response?.data?.error?.message ?? '관광지 수정에 실패했습니다.');
        }
    }, []);

    /** 관광지 활성화/비활성화 토글 */
    const toggleSiteActive = useCallback(async (siteId: number) => {
        const target = sites.find((site) => site.siteId === siteId);
        if (!target) return;

        try {
            const response = target.isActive
                ? await deactivateSiteApi(siteId)
                : await activateSiteApi(siteId);
            const updated = toSite(response.data);
            setSites((previous) =>
                previous.map((site) => site.siteId === siteId ? updated : site),
            );
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { error?: { message?: string } } } };
            setError(apiError.response?.data?.error?.message ?? '상태 변경에 실패했습니다.');
        }
    }, [sites]);

    /** 관광지 삭제 — API 스펙에 삭제 엔드포인트 없음, 비활성화로 대체 */
    const deleteSite = useCallback(async (siteId: number) => {
        try {
            await deactivateSiteApi(siteId);
            // 비활성화 후 목록에서 제거하지 않고 상태만 갱신
            setSites((previous) =>
                previous.map((site) =>
                    site.siteId === siteId ? { ...site, isActive: false } : site,
                ),
            );
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { error?: { message?: string } } } };
            setError(apiError.response?.data?.error?.message ?? '관광지 비활성화에 실패했습니다.');
        }
    }, []);

    // ───────────── 필터 업데이트 ─────────────

    const updateFilter = useCallback((updates: Partial<SiteFilter>) => {
        setFilter((previous) => ({ ...previous, ...updates }));
        setPage(0);
    }, []);

    // ───────────── 초대 액션 ─────────────

    /** 관광지에 운영자 초대 */
    const inviteSiteAdmin = useCallback(async (siteId: number, email: string) => {
        try {
            const response = await createInviteApi({ site_id: siteId, email });
            setInvites((previous) => [toInvite(response.data), ...previous]);
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { error?: { code?: string; message?: string } } } };
            const code = apiError.response?.data?.error?.code;
            if (code === 'CONFLICT') {
                setError('해당 관광지에 동일 이메일로 대기 중인 초대가 이미 존재합니다.');
            } else {
                setError(apiError.response?.data?.error?.message ?? '운영자 초대에 실패했습니다.');
            }
        }
    }, []);

    /** 페이지네이션된 관광지 + 초대 정보 조합 */
    const sitesWithInvites: SiteWithInvites[] = useMemo(() => {
        return paginatedSites.map((site) => ({
            ...site,
            invites: invites.filter((invite) => invite.siteId === site.siteId),
        }));
    }, [paginatedSites, invites]);

    return {
        sites: paginatedSites,
        sitesWithInvites,
        totalSites: filteredSites.length,
        isLoading,
        error,
        filter,
        updateFilter,
        page,
        setPage,
        totalPages,
        createSite,
        updateSite,
        toggleSiteActive,
        deleteSite,
        inviteSiteAdmin,
    };
}
