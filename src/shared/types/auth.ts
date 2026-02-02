/**
 * Admin 사용자 역할
 */
export type AdminRole = 'PLATFORM_ADMIN' | 'SITE_ADMIN';

/**
 * 로그인 요청
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * 로그인 응답 (v4.0)
 * - PLATFORM_ADMIN: site_ids 없음
 * - SITE_ADMIN: site_ids 포함
 */
export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    admin_id: number;
    email: string;
    role: AdminRole;
    site_ids?: number[];  // SITE_ADMIN만 포함
}

/**
 * 토큰 갱신 요청
 */
export interface RefreshTokenRequest {
    refresh_token: string;
}

/**
 * 토큰 갱신 응답
 */
export interface RefreshTokenResponse {
    access_token: string;
    refresh_token: string;
}

/**
 * 내 정보 조회 응답
 */
export interface MeResponse {
    admin_id: number;
    email: string;
    role: AdminRole;
    site_ids: number[];  // PLATFORM_ADMIN은 빈 배열
}

