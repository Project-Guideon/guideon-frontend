import { apiClient } from '../client';
import type { ApiResponse } from '@/shared/types/api';
import type { AcceptInviteRequest, AcceptInviteResponse } from '@/features/invite/domain/entities/Invite';

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
    const response = await apiClient.post<ApiResponse<AcceptInviteResponse>>(
        `/admin/invites/${token}/accept`,
        data,
    );
    return response.data;
};
