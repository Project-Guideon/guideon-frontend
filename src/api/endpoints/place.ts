import { apiClient } from '../client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api';
import type { Place, PlaceCategory, ZoneSource, CreatePlaceRequest, UpdatePlaceRequest } from '@/features/place/domain/entities/Place';

/**
 * Place 이미지 업로드 응답 타입
 */
export interface PlaceImageResponse {
    imageUrl: string;
}

/**
 * 백엔드 Place API 원본 응답 타입 (snake_case 혼재)
 */
interface RawPlaceResponse {
    placeId?: number;
    place_id?: number;
    siteId?: number;
    site_id?: number;
    zoneId?: number | null;
    zone_id?: number | null;
    zoneSource?: string;
    zone_source?: string;
    name: string;
    nameJson?: Record<string, string> | null;
    name_json?: Record<string, string> | null;
    category: string;
    latitude: number;
    longitude: number;
    description?: string | null;
    imageUrl?: string | null;
    image_url?: string | null;
    isActive?: boolean;
    is_active?: boolean;
    createdAt?: string;
    created_at?: string;
    updatedAt?: string;
    updated_at?: string;
}

/**
 * 백엔드 응답(snake_case/camelCase 혼재)을 프론트 Place 엔티티로 정규화
 */
function toPlace(raw: RawPlaceResponse): Place {
    return {
        placeId: raw.placeId ?? raw.place_id ?? 0,
        siteId: raw.siteId ?? raw.site_id ?? 0,
        zoneId: raw.zoneId ?? raw.zone_id ?? null,
        zoneSource: (raw.zoneSource ?? raw.zone_source ?? 'AUTO') as ZoneSource,
        name: raw.name,
        nameJson: raw.nameJson ?? raw.name_json ?? null,
        category: raw.category as PlaceCategory,
        latitude: raw.latitude,
        longitude: raw.longitude,
        description: raw.description ?? null,
        imageUrl: raw.imageUrl ?? raw.image_url ?? null,
        isActive: raw.isActive ?? raw.is_active ?? true,
        createdAt: raw.createdAt ?? raw.created_at ?? '',
        updatedAt: raw.updatedAt ?? raw.updated_at ?? '',
    };
}

/**
 * Place API 요청 시 snake_case 변환
 */
function toPlaceCreateBody(request: CreatePlaceRequest) {
    return {
        name: request.name,
        name_json: request.nameJson,
        category: request.category,
        latitude: request.latitude,
        longitude: request.longitude,
        description: request.description,
        image_url: request.imageUrl,
        is_active: request.isActive,
        zone_source: request.zoneSource,
        zone_id: request.zoneId,
    };
}

function toPlaceUpdateBody(request: UpdatePlaceRequest) {
    const body: Record<string, unknown> = {};
    if (request.name !== undefined) body.name = request.name;
    if (request.nameJson !== undefined) body.name_json = request.nameJson;
    if (request.category !== undefined) body.category = request.category;
    if (request.latitude !== undefined) body.latitude = request.latitude;
    if (request.longitude !== undefined) body.longitude = request.longitude;
    if (request.description !== undefined) body.description = request.description;
    if (request.imageUrl !== undefined) body.image_url = request.imageUrl;
    if (request.isActive !== undefined) body.is_active = request.isActive;
    if (request.zoneSource !== undefined) body.zone_source = request.zoneSource;
    if (request.zoneId !== undefined) body.zone_id = request.zoneId;
    return body;
}

/**
 * Place API Endpoints
 *
 * GET    /admin/sites/{siteId}/places                  - 장소 목록
 * GET    /admin/sites/{siteId}/places/{placeId}        - 장소 상세
 * POST   /admin/sites/{siteId}/places                  - 장소 생성
 * PATCH  /admin/sites/{siteId}/places/{placeId}        - 장소 수정
 * DELETE /admin/sites/{siteId}/places/{placeId}        - 장소 삭제
 * POST   /admin/sites/{siteId}/places/image            - 장소 이미지 업로드
 */

/**
 * 장소 목록 조회
 */
export const getPlacesApi = async (
    siteId: number,
    params?: {
        keyword?: string;
        category?: string;
        zone_id?: number;
        is_active?: boolean;
        page?: number;
        size?: number;
        sort?: string;
    },
) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<RawPlaceResponse>>>(
        `/admin/sites/${siteId}/places`,
        { params },
    );
    return {
        ...response.data,
        data: {
            ...response.data.data,
            items: response.data.data.items.map(toPlace),
        },
    };
};

/**
 * 장소 상세 조회
 */
export const getPlaceApi = async (siteId: number, placeId: number) => {
    const response = await apiClient.get<ApiResponse<RawPlaceResponse>>(
        `/admin/sites/${siteId}/places/${placeId}`,
    );
    return {
        ...response.data,
        data: toPlace(response.data.data),
    };
};

/**
 * 장소 생성
 */
export const createPlaceApi = async (siteId: number, request: CreatePlaceRequest) => {
    const response = await apiClient.post<ApiResponse<RawPlaceResponse>>(
        `/admin/sites/${siteId}/places`,
        toPlaceCreateBody(request),
    );
    return {
        ...response.data,
        data: toPlace(response.data.data),
    };
};

/**
 * 장소 수정 (null인 필드는 무시, zoneSource=AUTO 변경 시 zone 재계산)
 */
export const updatePlaceApi = async (siteId: number, placeId: number, request: UpdatePlaceRequest) => {
    const response = await apiClient.patch<ApiResponse<RawPlaceResponse>>(
        `/admin/sites/${siteId}/places/${placeId}`,
        toPlaceUpdateBody(request),
    );
    return {
        ...response.data,
        data: toPlace(response.data.data),
    };
};

/**
 * 장소 삭제 (soft delete)
 */
export const deletePlaceApi = async (siteId: number, placeId: number) => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; placeId: number; place_id?: number }>>(
        `/admin/sites/${siteId}/places/${placeId}`,
    );
    const raw = response.data.data;
    return {
        ...response.data,
        data: {
            deleted: raw.deleted,
            placeId: raw.placeId ?? raw.place_id ?? placeId,
        },
    };
};

/**
 * 장소 이미지 선업로드 (multipart/form-data)
 * 반환된 imageUrl을 장소 생성/수정에 사용
 */
export const uploadPlaceImageApi = async (siteId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<PlaceImageResponse & { image_url?: string }>>(
        `/admin/sites/${siteId}/places/image`,
        formData,
    );
    const raw = response.data.data;
    return {
        ...response.data,
        data: {
            imageUrl: raw.imageUrl ?? raw.image_url ?? '',
        },
    };
};
