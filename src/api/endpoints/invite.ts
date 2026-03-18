import axios from 'axios';
import type { ApiResponse } from '@/shared/types/api';
import type { AcceptInviteRequest, AcceptInviteResponse } from '@/features/invite/domain/entities/Invite';

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
 * POST /admin/invites/{inviteToken}/accept - 초대 수락 + 계정 생성 (공개, 인증 불필요)
 */

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
