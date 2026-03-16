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
 * Invite 응답 타입
 */
export interface InviteResponse {
    invite_id: number;
    site_id: number;
    site_name: string;
    email: string;
    role: string;
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
    expires_at: string;
    created_at: string;
    token?: string;
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
 *
 * POST   /admin/invites                     - 운영자 초대
 * GET    /admin/invites                     - 초대 목록 조회
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

/**
 * 운영자 초대 생성 (PLATFORM_ADMIN 전용)
 */
export const createInviteApi = async (data: { site_id: number; email: string }) => {
    const response = await apiClient.post<ApiResponse<InviteResponse>>(
        '/admin/invites',
        data,
    );
    return response.data;
};

/**
 * 초대 목록 조회 (PLATFORM_ADMIN 전용)
 */
export const getInvitesApi = async () => {
    const response = await apiClient.get<ApiResponse<InviteResponse[]>>(
        '/admin/invites',
    );
    return response.data;
};
