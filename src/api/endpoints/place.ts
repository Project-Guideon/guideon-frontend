import { apiClient } from '../client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api';
import type { Place, CreatePlaceRequest, UpdatePlaceRequest } from '@/features/place/domain/entities/Place';

/**
 * Place 이미지 업로드 응답 타입
 */
export interface PlaceImageResponse {
    imageUrl: string;
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
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Place>>>(
        `/admin/sites/${siteId}/places`,
        { params },
    );
    return response.data;
};

/**
 * 장소 상세 조회
 */
export const getPlaceApi = async (siteId: number, placeId: number) => {
    const response = await apiClient.get<ApiResponse<Place>>(
        `/admin/sites/${siteId}/places/${placeId}`,
    );
    return response.data;
};

/**
 * 장소 생성
 */
export const createPlaceApi = async (siteId: number, request: CreatePlaceRequest) => {
    const response = await apiClient.post<ApiResponse<Place>>(
        `/admin/sites/${siteId}/places`,
        request,
    );
    return response.data;
};

/**
 * 장소 수정 (null인 필드는 무시, zoneSource=AUTO 변경 시 zone 재계산)
 */
export const updatePlaceApi = async (siteId: number, placeId: number, request: UpdatePlaceRequest) => {
    const sanitized = Object.fromEntries(
        Object.entries(request).filter(([, value]) => value !== undefined),
    );
    const response = await apiClient.patch<ApiResponse<Place>>(
        `/admin/sites/${siteId}/places/${placeId}`,
        sanitized,
    );
    return response.data;
};

/**
 * 장소 삭제 (soft delete)
 */
export const deletePlaceApi = async (siteId: number, placeId: number) => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; placeId: number }>>(
        `/admin/sites/${siteId}/places/${placeId}`,
    );
    return response.data;
};

/**
 * 장소 이미지 선업로드 (multipart/form-data)
 * 반환된 imageUrl을 장소 생성/수정에 사용
 */
export const uploadPlaceImageApi = async (siteId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<PlaceImageResponse>>(
        `/admin/sites/${siteId}/places/image`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
};
