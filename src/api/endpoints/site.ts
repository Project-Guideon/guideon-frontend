import { apiClient } from '../client';
import type { ApiResponse } from '@/shared/types/api';

/**
 * Site 응답 타입
 */
export interface SiteResponse {
    siteId: number;
    name: string;
    isActive: boolean;
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
export const createSiteApi = async (data: { name: string }) => {
    const response = await apiClient.post<ApiResponse<SiteResponse>>(
        '/admin/sites',
        data,
    );
    return response.data;
};

/**
 * 관광지 수정 (PLATFORM_ADMIN 전용)
 */
export const updateSiteApi = async (siteId: number, data: { name: string }) => {
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

