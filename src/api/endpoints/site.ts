import { apiClient } from '../client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api';

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
 * GET  /admin/sites           - 관광지 목록 (PLATFORM_ADMIN)
 * GET  /admin/sites/{siteId}  - 관광지 상세
 */

/**
 * 관광지 목록 조회 (PLATFORM_ADMIN 전용)
 */
export const getSitesApi = async (params?: { page?: number; size?: number }) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<SiteResponse>>>(
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
