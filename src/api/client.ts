import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * API 클라이언트
 */
export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * 토큰 저장/조회/삭제 헬퍼
 */
export const tokenStorage = {
    getAccessToken: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(TOKEN_KEY);
    },
    getRefreshToken: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },
    setTokens: (accessToken: string, refreshToken: string): void => {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },
    clearTokens: (): void => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
};

/**
 * 모든 요청에 Authorization 헤더 자동 주입
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = tokenStorage.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

/**
 * 토큰 갱신 중복 방지
 */
let isRefreshing = false;
let pendingRequests: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

function processPendingRequests(token: string | null, error: unknown = null): void {
    pendingRequests.forEach(({ resolve, reject }) => {
        if (token) {
            resolve(token);
        } else {
            reject(error);
        }
    });
    pendingRequests = [];
}

function redirectToLogin(): void {
    tokenStorage.clearTokens();
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
}

/**
 * 401 → refresh 토큰으로 갱신 시도 → 실패 시 로그아웃
 * 403 (ACCESS_DENIED, ADMIN_SITE_FORBIDDEN, SITE_INACTIVE) → 권한 에러 로그
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (typeof window === 'undefined') return Promise.reject(error);

        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const status = error.response?.status;
        const errorCode = (error.response?.data as { error?: { code?: string } })?.error?.code;

        // 401 + 아직 재시도 안 한 요청 → refresh 시도
        if (status === 401 && !originalRequest._retry) {
            // refresh 엔드포인트 자체가 401이면 바로 로그아웃
            if (originalRequest.url?.includes('/admin/auth/refresh')) {
                redirectToLogin();
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            if (isRefreshing) {
                // 이미 갱신 진행 중 → 대기열에 추가
                return new Promise<string>((resolve, reject) => {
                    pendingRequests.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                });
            }

            isRefreshing = true;
            const refreshToken = tokenStorage.getRefreshToken();

            if (!refreshToken) {
                isRefreshing = false;
                redirectToLogin();
                return Promise.reject(error);
            }

            try {
                const response = await apiClient.post('/admin/auth/refresh', {
                    refresh_token: refreshToken,
                });
                const { access_token, refresh_token } = response.data.data;

                tokenStorage.setTokens(access_token, refresh_token);
                processPendingRequests(access_token);

                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                processPendingRequests(null, refreshError);
                redirectToLogin();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // 권한 관련 에러
        if (
            errorCode === 'ACCESS_DENIED' ||
            errorCode === 'ADMIN_SITE_FORBIDDEN' ||
            errorCode === 'SITE_INACTIVE'
        ) {
            console.error('접근 권한이 없습니다:', errorCode);
        }

        return Promise.reject(error);
    },
);
