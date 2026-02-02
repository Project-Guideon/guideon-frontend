import { apiClient } from '../client';
import type { ApiResponse } from '@/shared/types/api';
import type {
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    MeResponse,
} from '@/shared/types/auth';

/**
 * Auth API Endpoints (v4.0)
 * 
 * POST /admin/auth/login    - 로그인
 * POST /admin/auth/refresh  - 토큰 갱신
 * GET  /admin/auth/me       - 내 정보 조회
 * POST /admin/auth/logout   - 로그아웃
 */

/**
 * 로그인
 */
export const loginApi = async (data: LoginRequest) => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
        '/admin/auth/login',
        data
    );
    return response.data;
};

/**
 * 토큰 갱신
 */
export const refreshTokenApi = async (data: RefreshTokenRequest) => {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
        '/admin/auth/refresh',
        data
    );
    return response.data;
};

/**
 * 내 정보 조회
 */
export const getMeApi = async () => {
    const response = await apiClient.get<ApiResponse<MeResponse>>(
        '/admin/auth/me'
    );
    return response.data;
};

/**
 * 로그아웃
 */
export const logoutApi = async () => {
    const response = await apiClient.post<ApiResponse<null>>(
        '/admin/auth/logout'
    );
    return response.data;
};
