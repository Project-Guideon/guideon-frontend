'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Zone, CreateZoneRequest, UpdateZoneRequest } from '@/features/zone/domain/entities/Zone';
import { useSiteContext } from '@/features/auth/application/hooks/useAuth';
import { getZonesApi, createZoneApi, updateZoneApi, deleteZoneApi, recalcZonesApi } from '@/api/endpoints/zone';
import type { RecalcResponse } from '@/api/endpoints/zone';
import type { ApiError } from '@/shared/types/api';
import { extractApiError } from '@/shared/utils/api';

const MOCK_ZONES: Zone[] = [
    {
        zoneId: 1,
        siteId: 1,
        name: "근정전 영역",
        code: "Z-001",
        zoneType: "INNER",
        level: 1,
        parentZoneId: null,
        areaGeojson: {
            type: "Polygon",
            coordinates: [[
                [126.9763, 37.5783], [126.9778, 37.5783], 
                [126.9778, 37.5796], [126.9763, 37.5796], [126.9763, 37.5783]
            ]]
        },
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
    },
    {
        zoneId: 2,
        siteId: 1,
        name: "경회루 영역",
        code: "Z-002",
        zoneType: "INNER",
        level: 1,
        parentZoneId: null,
        areaGeojson: {
            type: "Polygon",
            coordinates: [[
                [126.9750, 37.5794], [126.9762, 37.5794], 
                [126.9762, 37.5805], [126.9750, 37.5805], [126.9750, 37.5794]
            ]]
        },
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
    },
    {
        zoneId: 3,
        siteId: 1,
        name: "광화문 및 협생문",
        code: "Z-GATE",
        zoneType: "INNER",
        level: 1,
        parentZoneId: null,
        areaGeojson: {
            type: "Polygon",
            coordinates: [[
                [126.9760, 37.5758], [126.9776, 37.5758], 
                [126.9776, 37.5765], [126.9760, 37.5765], [126.9760, 37.5758]
            ]]
        },
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
    },
    {
        zoneId: 4,
        siteId: 1,
        name: "사정전 영역",
        code: "Z-OFFICE",
        zoneType: "SUB", 
        level: 2,
        parentZoneId: 1,
        areaGeojson: {
            type: "Polygon",
            coordinates: [[
                [126.9765, 37.5797], [126.9775, 37.5797], 
                [126.9775, 37.5803], [126.9765, 37.5803], [126.9765, 37.5797]
            ]]
        },
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
    },
    {
        zoneId: 5,
        siteId: 1,
        name: "교태전(침전)",
        code: "Z-LIVING",
        zoneType: "INNER",
        level: 1,
        parentZoneId: null,
        areaGeojson: {
            type: "Polygon",
            coordinates: [[
                [126.9765, 37.5805], [126.9775, 37.5805], 
                [126.9775, 37.5812], [126.9765, 37.5812], [126.9765, 37.5805]
            ]]
        },
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
    },
    {
        zoneId: 3,
        siteId: 1,
        name: "광화문 및 협생문",
        code: "Z-GATE",
        zoneType: "INNER",
        level: 1,
        parentZoneId: null,
        areaGeojson: {
            type: "Polygon",
            coordinates: [[
                [126.9760, 37.5758], [126.9776, 37.5758], 
                [126.9776, 37.5765], [126.9760, 37.5765], [126.9760, 37.5758]
            ]]
        },
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
    },
    {
        zoneId: 4,
        siteId: 1,
        name: "사정전 영역",
        code: "Z-OFFICE",
        zoneType: "SUB",
        level: 2,
        parentZoneId: 1,
        areaGeojson: {
            type: "Polygon",
            coordinates: [[
                [126.9765, 37.5797], [126.9775, 37.5797], 
                [126.9775, 37.5803], [126.9765, 37.5803], [126.9765, 37.5797]
            ]]
        },
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
    },
    {
        zoneId: 5,
        siteId: 1,
        name: "교태전(침전)",
        code: "Z-LIVING",
        zoneType: "INNER",
        level: 1,
        parentZoneId: null,
        areaGeojson: {
            type: "Polygon",
            coordinates: [[
                [126.9765, 37.5805], [126.9775, 37.5805], 
                [126.9775, 37.5812], [126.9765, 37.5812], [126.9765, 37.5805]
            ]]
        },
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01"
    }
];

interface UseZonesReturn {
    zones: Zone[];
    innerZones: Zone[];
    getSubZones: (parentZoneId: number) => Zone[];
    selectedZone: Zone | null;
    selectedZoneId: number | null;
    setSelectedZoneId: (id: number | null) => void;
    createZone: (request: CreateZoneRequest) => Promise<Zone>;
    updateZone: (zoneId: number, request: UpdateZoneRequest) => Promise<Zone>;
    deleteZone: (zoneId: number) => Promise<void>;
    recalcZones: () => Promise<RecalcResponse>;
    refetchZones: () => Promise<void>;
    isLoading: boolean;
    isMutating: boolean;
    error: ApiError | null;
}

/**
 * Zone CRUD + 재계산 훅 (API 연동)
 *
 * - 현재 선택된 siteId 기준으로 Zone 목록을 가져옵니다.
 * - 생성/수정/삭제 후 자동으로 목록을 갱신합니다.
 */
export function useZones(): UseZonesReturn {
    const [zones, setZones] = useState<Zone[]>([]);
    const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMutating, setIsMutating] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const { currentSiteId } = useSiteContext();

    /** Zone 목록 전체 조회 (size=200으로 충분히 가져옴) */
    const fetchZones = useCallback(async () => {
        if (currentSiteId === null) {
            setZones([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getZonesApi(currentSiteId, { size: 200 });
            if (response.success) {
                setZones(response.data.items);
            } else {
                setZones([]);
                setError({ code: response.error?.code ?? 'INTERNAL_ERROR', message: response.error?.message ?? 'Zone 목록 조회에 실패했습니다.' });
            }
        } catch (err) {
            const apiError = extractApiError(err);
            setError(apiError);
            console.error('Zone 목록 조회 실패:', apiError);
        } finally {
            setIsLoading(false);
        }
    }, [currentSiteId]);

    /** siteId 변경 시 자동 조회 */
    useEffect(() => {
        fetchZones();
    }, [fetchZones]);

    const innerZones = useMemo(
        () => zones.filter((zone) => zone.zoneType === 'INNER'),
        [zones],
    );

    const getSubZones = useCallback(
        (parentZoneId: number) => zones.filter((zone) => zone.parentZoneId === parentZoneId),
        [zones],
    );

    const selectedZone = useMemo(
        () => zones.find((zone) => zone.zoneId === selectedZoneId) ?? null,
        [zones, selectedZoneId],
    );

    /** 구역 생성 */
    const createZone = useCallback(async (request: CreateZoneRequest): Promise<Zone> => {
        if (currentSiteId === null) {
            throw new Error('현재 사이트가 선택되지 않았습니다.');
        }

        setIsMutating(true);
        setError(null);

        try {
            const response = await createZoneApi(currentSiteId, request);
            if (response.success) {
                await fetchZones();
                return response.data;
            }
            throw new Error('구역 생성에 실패했습니다.');
        } catch (err) {
            const apiError = extractApiError(err);
            setError(apiError);
            throw err;
        } finally {
            setIsMutating(false);
        }
    }, [currentSiteId, fetchZones]);

    /** 구역 수정 (name, code, area_geojson만 변경 가능) */
    const updateZone = useCallback(async (zoneId: number, request: UpdateZoneRequest): Promise<Zone> => {
        if (currentSiteId === null) {
            throw new Error('현재 사이트가 선택되지 않았습니다.');
        }

        setIsMutating(true);
        setError(null);

        try {
            const response = await updateZoneApi(currentSiteId, zoneId, request);
            if (response.success) {
                await fetchZones();
                return response.data;
            }
            throw new Error('구역 수정에 실패했습니다.');
        } catch (err) {
            const apiError = extractApiError(err);
            setError(apiError);
            throw err;
        } finally {
            setIsMutating(false);
        }
    }, [currentSiteId, fetchZones]);

    /** 구역 삭제 (INNER 삭제 시 SUB cascade) */
    const deleteZone = useCallback(async (zoneId: number): Promise<void> => {
        if (currentSiteId === null) {
            throw new Error('현재 사이트가 선택되지 않았습니다.');
        }

        setIsMutating(true);
        setError(null);

        try {
            const response = await deleteZoneApi(currentSiteId, zoneId);
            if (response.success) {
                setSelectedZoneId((current) => (current === zoneId ? null : current));
                await fetchZones();
            }
        } catch (err) {
            const apiError = extractApiError(err);
            setError(apiError);
            throw err;
        } finally {
            setIsMutating(false);
        }
    }, [currentSiteId, fetchZones]);

    /** 구역 재계산 (zoneSource=AUTO인 Place/Device zone 재할당) */
    const recalcZones = useCallback(async (): Promise<RecalcResponse> => {
        if (currentSiteId === null) {
            throw new Error('현재 사이트가 선택되지 않았습니다.');
        }

        setIsMutating(true);
        setError(null);

        try {
            const response = await recalcZonesApi(currentSiteId);
            if (response.success) {
                return response.data;
            }
            throw new Error('구역 재계산에 실패했습니다.');
        } catch (err) {
            const apiError = extractApiError(err);
            setError(apiError);
            throw err;
        } finally {
            setIsMutating(false);
        }
    }, [currentSiteId]);

    return {
        zones:MOCK_ZONES,
        innerZones,
        getSubZones,
        selectedZone,
        selectedZoneId,
        setSelectedZoneId,
        createZone,
        updateZone,
        deleteZone,
        recalcZones,
        refetchZones: fetchZones,
        isLoading,
        isMutating,
        error,
    };
}
