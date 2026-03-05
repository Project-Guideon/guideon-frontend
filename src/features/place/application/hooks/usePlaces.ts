'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Place, PlaceCategory, CreatePlaceRequest, UpdatePlaceRequest } from '@/features/place/domain/entities/Place';
import { useSiteContext } from '@/features/auth/application/hooks/useAuth';

/** 경복궁 기준 Mock Place 데이터 */
const INITIAL_PLACES: Place[] = [
    {
        placeId: 1, siteId: 2, zoneId: 3, zoneSource: 'AUTO',
        name: '근정전 화장실', nameJson: { en: 'Geunjeongjeon Restroom', ja: '勤政殿トイレ' },
        category: 'TOILET', latitude: 37.5786, longitude: 126.9762,
        description: '근정전 동쪽 50m', imageUrl: null, isActive: true,
        createdAt: '2026-02-15T10:00:00', updatedAt: '2026-02-15T10:00:00',
    },
    {
        placeId: 2, siteId: 2, zoneId: 3, zoneSource: 'AUTO',
        name: '매표소', nameJson: { en: 'Ticket Office' },
        category: 'TICKET', latitude: 37.5783, longitude: 126.9768,
        description: '정문 입구 매표소', imageUrl: null, isActive: true,
        createdAt: '2026-02-15T10:05:00', updatedAt: '2026-02-15T10:05:00',
    },
    {
        placeId: 3, siteId: 2, zoneId: 4, zoneSource: 'AUTO',
        name: '경복궁 기념품샵', nameJson: { en: 'Gift Shop', ja: 'ギフトショップ' },
        category: 'SHOP', latitude: 37.5795, longitude: 126.9770,
        description: '사정전 옆 기념품 판매소', imageUrl: null, isActive: true,
        createdAt: '2026-02-15T10:10:00', updatedAt: '2026-02-15T10:10:00',
    },
    {
        placeId: 4, siteId: 2, zoneId: 2, zoneSource: 'AUTO',
        name: '경회루 휴게소', nameJson: { en: 'Gyeonghoeru Rest Area' },
        category: 'RESTAURANT', latitude: 37.5800, longitude: 126.9740,
        description: '경회루 남쪽 휴게 공간', imageUrl: null, isActive: true,
        createdAt: '2026-02-15T10:15:00', updatedAt: '2026-02-15T10:15:00',
    },
    {
        placeId: 5, siteId: 2, zoneId: 2, zoneSource: 'MANUAL',
        name: '관람 안내소', nameJson: { en: 'Information Center' },
        category: 'INFO', latitude: 37.5805, longitude: 126.9745,
        description: '경회루 권역 안내소', imageUrl: null, isActive: true,
        createdAt: '2026-02-15T10:20:00', updatedAt: '2026-02-15T10:20:00',
    },
    {
        placeId: 6, siteId: 2, zoneId: 1, zoneSource: 'AUTO',
        name: '근정전', nameJson: { en: 'Geunjeongjeon Hall', ja: '勤政殿', zh: '勤政殿' },
        category: 'ATTRACTION', latitude: 37.5790, longitude: 126.9769,
        description: '조선 왕실의 정전', imageUrl: null, isActive: true,
        createdAt: '2026-02-15T10:25:00', updatedAt: '2026-02-15T10:25:00',
    },
    {
        placeId: 7, siteId: 2, zoneId: null, zoneSource: 'AUTO',
        name: '주차장 A', nameJson: { en: 'Parking Lot A' },
        category: 'PARKING', latitude: 37.5775, longitude: 126.9755,
        description: '정문 앞 주차장', imageUrl: null, isActive: true,
        createdAt: '2026-02-15T10:30:00', updatedAt: '2026-02-15T10:30:00',
    },
    {
        placeId: 8, siteId: 2, zoneId: 3, zoneSource: 'AUTO',
        name: '무료 해설 집결지', nameJson: { en: 'Free Tour Meeting Point' },
        category: 'OTHER', latitude: 37.5785, longitude: 126.9765,
        description: '정시 무료 해설 출발 지점', imageUrl: null, isActive: false,
        createdAt: '2026-02-15T10:35:00', updatedAt: '2026-02-15T10:35:00',
    },
];

/** Place CRUD 상태 관리 및 필터링 Mock 훅 */
export function usePlaces() {
    const [places, setPlaces] = useState<Place[]>(INITIAL_PLACES);
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<PlaceCategory | 'ALL'>('ALL');
    const [zoneIdFilter, setZoneIdFilter] = useState<number | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');

    const { currentSiteId } = useSiteContext();

    const filteredPlaces = useMemo(() => {
        return places.filter((place) => {
            if (currentSiteId !== null && place.siteId !== currentSiteId) return false;
            if (categoryFilter !== 'ALL' && place.category !== categoryFilter) return false;
            if (zoneIdFilter !== null && place.zoneId !== zoneIdFilter) return false;
            if (searchKeyword) {
                const normalizedSearch = searchKeyword.trim().toLowerCase();
                const normalizedName = place.name.trim().toLowerCase();
                if (!normalizedName.includes(normalizedSearch)) return false;
            }
            return true;
        });
    }, [places, currentSiteId, categoryFilter, zoneIdFilter, searchKeyword]);

    const selectedPlace = places.find((place) => place.placeId === selectedPlaceId) ?? null;

    const createPlace = useCallback((request: CreatePlaceRequest) => {
        if (currentSiteId == null) {
            throw new Error('현재 사이트가 선택되지 않았습니다.');
        }

        const now = new Date().toISOString();
        const newPlace: Place = {
            placeId: Date.now(),
            siteId: currentSiteId,
            zoneId: request.zoneId ?? null,
            zoneSource: request.zoneSource ?? 'AUTO',
            name: request.name,
            nameJson: request.nameJson ?? null,
            category: request.category,
            latitude: request.latitude,
            longitude: request.longitude,
            description: request.description ?? null,
            imageUrl: request.imageUrl ?? null,
            isActive: request.isActive ?? true,
            createdAt: now,
            updatedAt: now,
        };
        setPlaces((previous) => [...previous, newPlace]);
        return newPlace;
    }, [currentSiteId]);

    const updatePlace = useCallback((placeId: number, request: UpdatePlaceRequest) => {
        const sanitizedRequest = Object.fromEntries(
            Object.entries(request).filter(([, value]) => value !== undefined)
        );

        setPlaces((previous) =>
            previous.map((place) =>
                place.placeId === placeId
                    ? { ...place, ...sanitizedRequest, updatedAt: new Date().toISOString() }
                    : place,
            ),
        );
    }, []);

    const deletePlace = useCallback((placeId: number) => {
        setPlaces((previous) => previous.filter((place) => place.placeId !== placeId));
        setSelectedPlaceId((current) => (current === placeId ? null : current));
    }, []);

    return {
        places,
        filteredPlaces,
        selectedPlace,
        selectedPlaceId,
        setSelectedPlaceId,
        categoryFilter,
        setCategoryFilter,
        zoneIdFilter,
        setZoneIdFilter,
        searchKeyword,
        setSearchKeyword,
        createPlace,
        updatePlace,
        deletePlace,
    };
}
