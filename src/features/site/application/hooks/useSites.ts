'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Site, CreateSiteRequest, UpdateSiteRequest } from '@/features/site/domain/entities/Site';

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
 * useSites — 관광지 데이터 CRUD 및 필터 관리 훅
 *
 * 향후 API 연동 시 Mock 데이터를 API 호출로 교체하면 됩니다.
 */
export function useSites() {
    const [sites, setSites] = useState<Site[]>(INITIAL_MOCK_SITES);
    const [filter, setFilter] = useState<SiteFilter>({
        searchTerm: '',
        activeStatus: 'all',
    });
    const [page, setPage] = useState(0);
    const pageSize = 5;

    /** 다음 ID 계산 */
    const getNextId = useCallback(() => {
        return Math.max(...sites.map((site) => site.siteId), 0) + 1;
    }, [sites]);

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
        const newSite: Site = {
            siteId: getNextId(),
            name: request.name,
            isActive: true,
            createdAt: timestamp,
            updatedAt: timestamp,
        };
        setSites((previous) => [newSite, ...previous]);
    }, [getNextId]);

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
        setSites((previous) => previous.filter((site) => site.siteId !== siteId));
        // 삭제 후 현재 페이지가 범위를 벗어나면 이전 페이지로 이동
        const newFiltered = sites.filter((site) => site.siteId !== siteId);
        const newTotalPages = Math.ceil(newFiltered.length / pageSize);
        if (page >= newTotalPages && newTotalPages > 0) {
            setPage(newTotalPages - 1);
        }
    }, [sites, page, pageSize]);

    // ───────────── 필터 업데이트 ─────────────

    const updateFilter = useCallback((updates: Partial<SiteFilter>) => {
        setFilter((previous) => ({ ...previous, ...updates }));
        setPage(0);
    }, []);

    return {
        sites: paginatedSites,
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
    };
}
