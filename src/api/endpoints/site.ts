import { apiClient } from '../client';
import type { ApiResponse } from '@/shared/types/api';
import type { CreateSiteRequest, UpdateSiteRequest } from '@/features/site/domain/entities/Site';

/**
 * Site 응답 타입
 */
export interface SiteResponse {
    siteId: number;
    name: string;
    isActive: boolean;
    latitude: number | null;
    longitude: number | null;
    mapLevel: number | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Site API Endpoints
 *
 * GET    /admin/sites                       - 관광지 목록 (PLATFORM_ADMIN)
 * GET    /admin/sites/{siteId}              - 관광지 상세
 * POST   /admin/sites                       - 관광지 생성
 * PATCH  /admin/sites/{siteId}              - 관광지 수정
 * POST   /admin/sites/{siteId}/activate     - 관광지 활성화
 * POST   /admin/sites/{siteId}/deactivate   - 관광지 비활성화
 */

/**
 * 관광지 목록 조회 (PLATFORM_ADMIN 전용)
 */
export const getSitesApi = async (params?: { page?: number; size?: number }) => {
    const response = await apiClient.get<ApiResponse<SiteResponse[]>>(
        '/admin/sites',
        { params },
    );
    return response.data;
};

/**
 * 관광지 상세 조회
 */
export const getSiteApi = async (siteId: number) => {
    const response = await apiClient.get<ApiResponse<SiteResponse>>(
        `/admin/sites/${siteId}`,
    );
    return response.data;
};

/**
 * 관광지 생성 (PLATFORM_ADMIN 전용)
 */
export const createSiteApi = async (data: CreateSiteRequest) => {
    const response = await apiClient.post<ApiResponse<SiteResponse>>(
        '/admin/sites',
        data,
    );
    return response.data;
};

/**
 * 관광지 수정 (PLATFORM_ADMIN 전용)
 *
 * ⚠️ 좌표 필드를 생략하면 서버에서 null로 덮어씁니다.
 * 기존 좌표 보존이 필요하면 항상 전체 필드를 전송해야 합니다.
 */
export const updateSiteApi = async (siteId: number, data: UpdateSiteRequest) => {
    const response = await apiClient.patch<ApiResponse<SiteResponse>>(
        `/admin/sites/${siteId}`,
        data,
    );
    return response.data;
};

/**
 * 관광지 활성화 (PLATFORM_ADMIN 전용)
 */
export const activateSiteApi = async (siteId: number) => {
    const response = await apiClient.post<ApiResponse<SiteResponse>>(
        `/admin/sites/${siteId}/activate`,
    );
    return response.data;
};

/**
 * 관광지 비활성화 (PLATFORM_ADMIN 전용)
 */
export const deactivateSiteApi = async (siteId: number) => {
    const response = await apiClient.post<ApiResponse<SiteResponse>>(
        `/admin/sites/${siteId}/deactivate`,
    );
    return response.data;
};

