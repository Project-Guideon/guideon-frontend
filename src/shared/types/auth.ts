/**
 * Admin 사용자 역할
 */
export type AdminRole = 'PLATFORM_ADMIN' | 'SITE_ADMIN';

/**
 * Admin 사용자 정보
 */
export interface AdminUser {
    adminId: number;
    email: string;
    role: AdminRole;
    isActive: boolean;
    lastLoginAt: string | null;
    sites?: Site[];
}

/**
 * 관광지 (Site) - 간략 정보
 */
export interface Site {
    siteId: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * 로그인 요청
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * 로그인 응답
 */
export interface LoginResponse {
    accessToken: string;
    refreshToken?: string;
    user: AdminUser;
}
