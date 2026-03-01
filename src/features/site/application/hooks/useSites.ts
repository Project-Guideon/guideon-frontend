'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Site, SiteInvite, SiteWithInvites, CreateSiteRequest, UpdateSiteRequest } from '@/features/site/domain/entities/Site';

/**
 * 관광지 필터 상태
 */
interface SiteFilter {
    searchTerm: string;
    activeStatus: 'all' | 'active' | 'inactive';
}

/**
 * Mock 데이터 — 향후 API 연동 시 이 부분만 교체
 */
const INITIAL_MOCK_SITES: Site[] = [
    {
        siteId: 1,
        name: '에버랜드',
        isActive: true,
        createdAt: '2026-01-15T09:00:00',
        updatedAt: '2026-01-15T09:00:00',
    },
    {
        siteId: 2,
        name: '경복궁',
        isActive: true,
        createdAt: '2026-01-18T10:30:00',
        updatedAt: '2026-02-01T14:00:00',
    },
    {
        siteId: 3,
        name: '서울랜드',
        isActive: false,
        createdAt: '2026-01-20T11:00:00',
        updatedAt: '2026-01-25T16:00:00',
    },
    {
        siteId: 4,
        name: '제주 민속촌',
        isActive: true,
        createdAt: '2026-01-22T08:00:00',
        updatedAt: '2026-01-22T08:00:00',
    },
    {
        siteId: 5,
        name: '롯데월드',
        isActive: true,
        createdAt: '2026-01-25T13:00:00',
        updatedAt: '2026-02-10T09:30:00',
    },
    {
        siteId: 6,
        name: '한국민속촌',
        isActive: false,
        createdAt: '2026-01-28T10:00:00',
        updatedAt: '2026-02-05T11:00:00',
    },
    {
        siteId: 7,
        name: '부산 해운대 관광특구',
        isActive: true,
        createdAt: '2026-02-01T09:00:00',
        updatedAt: '2026-02-01T09:00:00',
    },
    {
        siteId: 8,
        name: '남산타워',
        isActive: true,
        createdAt: '2026-02-03T14:00:00',
        updatedAt: '2026-02-03T14:00:00',
    },
];

/**
 * Mock 초대 데이터
 */
const INITIAL_MOCK_INVITES: SiteInvite[] = [
    { inviteId: 1, siteId: 1, email: 'operator@everland.com', status: 'ACCEPTED', createdAt: '2026-01-16T10:00:00' },
    { inviteId: 2, siteId: 2, email: 'admin@gyeongbokgung.kr', status: 'PENDING', createdAt: '2026-02-20T09:00:00' },
    { inviteId: 3, siteId: 5, email: 'manager@lotteworld.com', status: 'ACCEPTED', createdAt: '2026-01-26T11:00:00' },
    { inviteId: 4, siteId: 5, email: 'staff@lotteworld.com', status: 'EXPIRED', createdAt: '2026-01-10T08:00:00' },
    { inviteId: 5, siteId: 7, email: 'admin@haeundae.kr', status: 'ACCEPTED', createdAt: '2026-02-02T10:00:00' },
];

/**
 * useSites — 관광지 데이터 CRUD 및 필터 관리 훅
 *
 * 향후 API 연동 시 Mock 데이터를 API 호출로 교체하면 됩니다.
 */
export function useSites() {
    const [sites, setSites] = useState<Site[]>(INITIAL_MOCK_SITES);
    const [invites, setInvites] = useState<SiteInvite[]>(INITIAL_MOCK_INVITES);
    const [filter, setFilter] = useState<SiteFilter>({
        searchTerm: '',
        activeStatus: 'all',
    });
    const [page, setPage] = useState(0);
    const pageSize = 5;

    /** 현재 시간 문자열 */
    const getCurrentTimestamp = () => new Date().toISOString().slice(0, 19);

    // ───────────── 필터링 ─────────────

    const filteredSites = useMemo(() => {
        return sites.filter((site) => {
            // 검색어 필터
            if (filter.searchTerm) {
                const term = filter.searchTerm.toLowerCase();
                if (!site.name.toLowerCase().includes(term)) return false;
            }
            // 활성 상태 필터
            if (filter.activeStatus === 'active' && !site.isActive) return false;
            if (filter.activeStatus === 'inactive' && site.isActive) return false;

            return true;
        });
    }, [sites, filter]);

    // ───────────── 페이지네이션 ─────────────

    const totalPages = Math.ceil(filteredSites.length / pageSize);

    const paginatedSites = useMemo(() => {
        const start = page * pageSize;
        return filteredSites.slice(start, start + pageSize);
    }, [filteredSites, page]);

    // ───────────── CRUD 액션 ─────────────

    /** 관광지 생성 */
    const createSite = useCallback((request: CreateSiteRequest) => {
        const timestamp = getCurrentTimestamp();
        setSites((previous) => {
            const nextId = Math.max(...previous.map((site) => site.siteId), 0) + 1;
            const newSite: Site = {
                siteId: nextId,
                name: request.name,
                isActive: true,
                createdAt: timestamp,
                updatedAt: timestamp,
            };
            return [newSite, ...previous];
        });
    }, []);

    /** 관광지 수정 */
    const updateSite = useCallback((siteId: number, request: UpdateSiteRequest) => {
        setSites((previous) =>
            previous.map((site) =>
                site.siteId === siteId
                    ? { ...site, name: request.name, updatedAt: getCurrentTimestamp() }
                    : site
            )
        );
    }, []);

    /** 관광지 활성화/비활성화 토글 */
    const toggleSiteActive = useCallback((siteId: number) => {
        setSites((previous) =>
            previous.map((site) =>
                site.siteId === siteId
                    ? { ...site, isActive: !site.isActive, updatedAt: getCurrentTimestamp() }
                    : site
            )
        );
    }, []);

    /** 관광지 삭제 */
    const deleteSite = useCallback((siteId: number) => {
        setSites((previous) => {
            const updated = previous.filter((site) => site.siteId !== siteId);

            // 삭제 후 필터 적용된 목록 기준으로 페이지 보정
            const newFilteredCount = updated.filter((site) => {
                if (filter.searchTerm) {
                    const term = filter.searchTerm.toLowerCase();
                    if (!site.name.toLowerCase().includes(term)) return false;
                }
                if (filter.activeStatus === 'active' && !site.isActive) return false;
                if (filter.activeStatus === 'inactive' && site.isActive) return false;
                return true;
            }).length;

            const newTotalPages = Math.ceil(newFilteredCount / pageSize);
            if (page >= newTotalPages && newTotalPages > 0) {
                setPage(newTotalPages - 1);
            } else if (newTotalPages === 0) {
                setPage(0);
            }

            return updated;
        });
    }, [filter, page, pageSize]);

    // ───────────── 필터 업데이트 ─────────────

    const updateFilter = useCallback((updates: Partial<SiteFilter>) => {
        setFilter((previous) => ({ ...previous, ...updates }));
        setPage(0);
    }, []);

    // ───────────── 초대 액션 ─────────────

    /** 해당 관광지의 초대 목록 조회 */
    const getInvitesForSite = useCallback((siteId: number): SiteInvite[] => {
        return invites.filter((invite) => invite.siteId === siteId);
    }, [invites]);

    /** 관광지에 운영자 초대 */
    const inviteSiteAdmin = useCallback((siteId: number, email: string) => {
        setInvites((previous) => {
            const nextId = Math.max(...previous.map((inv) => inv.inviteId), 0) + 1;
            const newInvite: SiteInvite = {
                inviteId: nextId,
                siteId,
                email,
                status: 'PENDING',
                createdAt: getCurrentTimestamp(),
            };
            return [newInvite, ...previous];
        });
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
        getInvitesForSite,
    };
}
