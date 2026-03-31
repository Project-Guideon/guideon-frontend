import axios from 'axios';
import { apiClient } from '../client';
import type { ApiResponse } from '@/shared/types/api';
import type { AcceptInviteRequest, AcceptInviteResponse } from '@/features/invite/domain/entities/Invite';

/**
 * Invite 응답 타입 (API snake_case)
 */
export interface InviteResponse {
    invite_id: number;
    site_id: number;
    site_name: string;
    email: string;
    role: string;
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
    expires_at: string;
    created_at: string;
    token?: string;
}

/**
 * 비인증 API 클라이언트
 * 초대 수락은 공개 엔드포인트이므로 Authorization 헤더를 주입하지 않는다.
 */
const publicClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api/v1',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

/**
 * Invite API Endpoints
 *
 * POST /admin/invites                        - 운영자 초대 생성 (PLATFORM_ADMIN)
 * GET  /admin/invites                        - 초대 목록 조회 (PLATFORM_ADMIN)
 * POST /admin/invites/{inviteId}/resend      - 초대 재발송 (PLATFORM_ADMIN)
 * POST /admin/invites/{inviteId}/expire      - 초대 만료 처리 (PLATFORM_ADMIN)
 * POST /admin/invites/{inviteToken}/accept   - 초대 수락 (비인증)
 */

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

/**
 * 초대 재발송 (PLATFORM_ADMIN 전용)
 * PENDING 상태의 초대에 대해 새 토큰을 발급하고 만료일을 리셋한 뒤 이메일을 재발송한다.
 */
export const resendInviteApi = async (inviteId: number) => {
    const response = await apiClient.post<ApiResponse<InviteResponse>>(
        `/admin/invites/${inviteId}/resend`,
    );
    return response.data;
};

/**
 * 초대 만료 처리 (PLATFORM_ADMIN 전용)
 * PENDING 상태의 초대를 만료 상태로 변경한다.
 */
export const expireInviteApi = async (inviteId: number) => {
    const response = await apiClient.post<ApiResponse<null>>(
        `/admin/invites/${inviteId}/expire`,
    );
    return response.data;
};

/**
 * 초대 수락 (비로그인)
 * 토큰 기반으로 계정 생성 + JWT 발급
 */
export const acceptInviteApi = async (token: string, data: AcceptInviteRequest) => {
    const response = await publicClient.post<ApiResponse<AcceptInviteResponse>>(
        `/admin/invites/${encodeURIComponent(token)}/accept`,
        data,
    );
    return response.data;
};
