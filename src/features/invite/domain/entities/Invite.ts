import type { AdminRole } from '@/shared/types/auth';

/**
 * 초대 수락 요청
 */
export interface AcceptInviteRequest {
    password: string;
}

/**
 * 초대 수락 응답
 * 계정 생성 + JWT 발급
 */
export interface AcceptInviteResponse {
    access_token: string;
    refresh_token: string;
    admin_id: number;
    email: string;
    role: AdminRole;
    site_ids: number[];
}

/**
 * 초대 수락 페이지 상태
 */
export type InviteAcceptStatus =
    | 'idle'
    | 'submitting'
    | 'success'
    | 'error';

/**
 * 초대 수락 에러 유형
 */
export type InviteErrorType =
    | 'INVITE_EXPIRED'
    | 'INVITE_ALREADY_USED'
    | 'VALIDATION_ERROR'
    | 'NOT_FOUND'
    | 'UNKNOWN';
