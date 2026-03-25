'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Place, PlaceCategory, CreatePlaceRequest, UpdatePlaceRequest } from '@/features/place/domain/entities/Place';
import { useSiteContext } from '@/features/auth/application/hooks/useAuth';
import { getPlacesApi, createPlaceApi, updatePlaceApi, deletePlaceApi } from '@/api/endpoints/place';
import type { ApiError } from '@/shared/types/api';

interface UsePlacesReturn {
    places: Place[];
    filteredPlaces: Place[];
    selectedPlace: Place | null;
    selectedPlaceId: number | null;
    setSelectedPlaceId: (id: number | null) => void;
    categoryFilter: PlaceCategory | 'ALL';
    setCategoryFilter: (category: PlaceCategory | 'ALL') => void;
    zoneIdFilter: number | null;
    setZoneIdFilter: (zoneId: number | null) => void;
    searchKeyword: string;
    setSearchKeyword: (keyword: string) => void;
    createPlace: (request: CreatePlaceRequest) => Promise<Place>;
    updatePlace: (placeId: number, request: UpdatePlaceRequest) => Promise<Place>;
    deletePlace: (placeId: number) => Promise<void>;
    refetchPlaces: () => Promise<void>;
    isLoading: boolean;
    isMutating: boolean;
    error: ApiError | null;
}

/**
 * Place CRUD 훅 (API 연동)
 *
 * - 현재 선택된 siteId 기준으로 Place 목록을 가져옵니다.
 * - 클라이언트 사이드 필터링 (카테고리, 구역, 키워드)
 * - 생성/수정/삭제 후 자동으로 목록을 갱신합니다.
 */
export function usePlaces(): UsePlacesReturn {
    const [places, setPlaces] = useState<Place[]>([]);
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<PlaceCategory | 'ALL'>('ALL');
    const [zoneIdFilter, setZoneIdFilter] = useState<number | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMutating, setIsMutating] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const { currentSiteId } = useSiteContext();

    /** Place 목록 전체 조회 */
    const fetchPlaces = useCallback(async () => {
        if (currentSiteId === null) {
            setPlaces([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getPlacesApi(currentSiteId, { size: 200 });
            if (response.success) {
                setPlaces(response.data.items);
            }
        } catch (err) {
            const apiError = extractApiError(err);
            setError(apiError);
            console.error('Place 목록 조회 실패:', apiError);
        } finally {
            setIsLoading(false);
        }
    }, [currentSiteId]);

    /** siteId 변경 시 자동 조회 */
    useEffect(() => {
        fetchPlaces();
    }, [fetchPlaces]);

    /** 클라이언트 사이드 필터링 */
    const filteredPlaces = useMemo(() => {
        return places.filter((place) => {
            if (categoryFilter !== 'ALL' && place.category !== categoryFilter) return false;
            if (zoneIdFilter !== null && place.zoneId !== zoneIdFilter) return false;
            if (searchKeyword) {
                const normalized = searchKeyword.trim().toLowerCase();
                if (!place.name.toLowerCase().includes(normalized)) return false;
            }
            return true;
        });
    }, [places, categoryFilter, zoneIdFilter, searchKeyword]);

    const selectedPlace = useMemo(
        () => filteredPlaces.find((place) => place.placeId === selectedPlaceId) ?? null,
        [filteredPlaces, selectedPlaceId],
    );

    /** 장소 생성 */
    const createPlace = useCallback(async (request: CreatePlaceRequest): Promise<Place> => {
        if (currentSiteId === null) {
            throw new Error('현재 사이트가 선택되지 않았습니다.');
        }

        setIsMutating(true);
        setError(null);

        try {
            const response = await createPlaceApi(currentSiteId, request);
            if (response.success) {
                await fetchPlaces();
                return response.data;
            }
            throw new Error('장소 생성에 실패했습니다.');
        } catch (err) {
            const apiError = extractApiError(err);
            setError(apiError);
            throw err;
        } finally {
            setIsMutating(false);
        }
    }, [currentSiteId, fetchPlaces]);

    /** 장소 수정 */
    const updatePlace = useCallback(async (placeId: number, request: UpdatePlaceRequest): Promise<Place> => {
        if (currentSiteId === null) {
            throw new Error('현재 사이트가 선택되지 않았습니다.');
        }

        setIsMutating(true);
        setError(null);

        try {
            const response = await updatePlaceApi(currentSiteId, placeId, request);
            if (response.success) {
                await fetchPlaces();
                return response.data;
            }
            throw new Error('장소 수정에 실패했습니다.');
        } catch (err) {
            const apiError = extractApiError(err);
            setError(apiError);
            throw err;
        } finally {
            setIsMutating(false);
        }
    }, [currentSiteId, fetchPlaces]);

    /** 장소 삭제 (soft delete) */
    const deletePlace = useCallback(async (placeId: number): Promise<void> => {
        if (currentSiteId === null) {
            throw new Error('현재 사이트가 선택되지 않았습니다.');
        }

        setIsMutating(true);
        setError(null);

        try {
            const response = await deletePlaceApi(currentSiteId, placeId);
            if (response.success) {
                setSelectedPlaceId((current) => (current === placeId ? null : current));
                await fetchPlaces();
            }
        } catch (err) {
            const apiError = extractApiError(err);
            setError(apiError);
            throw err;
        } finally {
            setIsMutating(false);
        }
    }, [currentSiteId, fetchPlaces]);

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
        refetchPlaces: fetchPlaces,
        isLoading,
        isMutating,
        error,
    };
}

/** Axios 에러에서 ApiError 추출 헬퍼 */
function extractApiError(err: unknown): ApiError {
    if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: ApiError } } };
        if (axiosError.response?.data?.error) {
            return axiosError.response.data.error;
        }
    }

    return {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
    };
}
