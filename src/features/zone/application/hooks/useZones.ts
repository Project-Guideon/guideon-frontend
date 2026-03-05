'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Zone, CreateZoneRequest, UpdateZoneRequest } from '@/features/zone/domain/entities/Zone';
import { useSiteContext } from '@/features/auth/application/hooks/useAuth';

/** 경복궁 기준 Mock Zone 데이터 */
const INITIAL_ZONES: Zone[] = [
    {
        zoneId: 1,
        siteId: 2,
        name: '근정전 권역',
        code: 'INNER_A',
        zoneType: 'INNER',
        level: 1,
        parentZoneId: null,
        areaGeojson: {
            type: 'Polygon',
            coordinates: [[[126.9755, 37.5780], [126.9780, 37.5780], [126.9780, 37.5800], [126.9755, 37.5800], [126.9755, 37.5780]]],
        },
        createdAt: '2026-02-15T10:00:00',
        updatedAt: '2026-02-15T10:00:00',
    },
    {
        zoneId: 2,
        siteId: 2,
        name: '경회루 권역',
        code: 'INNER_B',
        zoneType: 'INNER',
        level: 1,
        parentZoneId: null,
        areaGeojson: {
            type: 'Polygon',
            coordinates: [[[126.9730, 37.5790], [126.9755, 37.5790], [126.9755, 37.5810], [126.9730, 37.5810], [126.9730, 37.5790]]],
        },
        createdAt: '2026-02-15T10:05:00',
        updatedAt: '2026-02-15T10:05:00',
    },
    {
        zoneId: 3,
        siteId: 2,
        name: '근정전 앞마당',
        code: 'SUB_A1',
        zoneType: 'SUB',
        level: 2,
        parentZoneId: 1,
        areaGeojson: {
            type: 'Polygon',
            coordinates: [[[126.9758, 37.5782], [126.9770, 37.5782], [126.9770, 37.5792], [126.9758, 37.5792], [126.9758, 37.5782]]],
        },
        createdAt: '2026-02-15T10:10:00',
        updatedAt: '2026-02-15T10:10:00',
    },
    {
        zoneId: 4,
        siteId: 2,
        name: '사정전 구역',
        code: 'SUB_A2',
        zoneType: 'SUB',
        level: 2,
        parentZoneId: 1,
        areaGeojson: {
            type: 'Polygon',
            coordinates: [[[126.9760, 37.5793], [126.9778, 37.5793], [126.9778, 37.5799], [126.9760, 37.5799], [126.9760, 37.5793]]],
        },
        createdAt: '2026-02-15T10:15:00',
        updatedAt: '2026-02-15T10:15:00',
    },
];

/** Zone CRUD 상태 관리를 위한 Mock 훅 */
export function useZones() {
    const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
    const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

    const { currentSiteId } = useSiteContext();

    const filteredZones = useMemo(() => {
        if (currentSiteId === null) return [];
        return zones.filter((zone) => zone.siteId === currentSiteId);
    }, [zones, currentSiteId]);

    const innerZones = filteredZones.filter((zone) => zone.zoneType === 'INNER');

    const getSubZones = useCallback(
        (parentZoneId: number) => filteredZones.filter((zone) => zone.parentZoneId === parentZoneId),
        [filteredZones],
    );

    const selectedZone = filteredZones.find((zone) => zone.zoneId === selectedZoneId) ?? null;

    const createZone = useCallback((request: CreateZoneRequest) => {
        const now = new Date().toISOString();
        const newZone: Zone = {
            zoneId: Date.now(),
            siteId: currentSiteId ?? 1, // Fallback to 1
            name: request.name,
            code: request.code,
            zoneType: request.zoneType,
            level: request.zoneType === 'INNER' ? 1 : 2,
            parentZoneId: request.parentZoneId,
            areaGeojson: request.areaGeojson,
            createdAt: now,
            updatedAt: now,
        };
        setZones((previous) => [...previous, newZone]);
        return newZone;
    }, [currentSiteId]);

    const updateZone = useCallback((zoneId: number, request: UpdateZoneRequest) => {
        setZones((previous) =>
            previous.map((zone) =>
                zone.zoneId === zoneId
                    ? { ...zone, ...request, updatedAt: new Date().toISOString() }
                    : zone,
            ),
        );
    }, []);

    const deleteZone = useCallback((zoneId: number) => {
        setZones((previous) =>
            previous.filter((zone) => zone.zoneId !== zoneId && zone.parentZoneId !== zoneId),
        );
        setSelectedZoneId((current) => (current === zoneId ? null : current));
    }, []);

    return {
        zones: filteredZones,
        innerZones,
        getSubZones,
        selectedZone,
        selectedZoneId,
        setSelectedZoneId,
        createZone,
        updateZone,
        deleteZone,
    };
}
