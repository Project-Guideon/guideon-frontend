import axios from 'axios';

/**
 * API 클라이언트
 */
export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * - 모든 요청에 Authorization 헤더 자동 주입
 */
apiClient.interceptors.request.use(
    (config) => {
        // 클라이언트 사이드에서만 localStorage 접근
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * AUTH_REQUIRED, AUTH_INVALID → 로그아웃
 * ACCESS_DENIED, ADMIN_SITE_FORBIDDEN, SITE_INACTIVE → 권한 에러
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== 'undefined') {
            const errorCode = error.response?.data?.error?.code;
            const status = error.response?.status;

            // 인증 관련 에러 → 로그아웃
            if (errorCode === 'AUTH_REQUIRED' || errorCode === 'AUTH_INVALID' || status === 401) {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
            }

            // 권한 관련 에러
            if (
                errorCode === 'ACCESS_DENIED' ||
                errorCode === 'ADMIN_SITE_FORBIDDEN' ||
                errorCode === 'SITE_INACTIVE'
            ) {
                console.error('접근 권한이 없습니다:', errorCode);
            }
        }

        return Promise.reject(error);
    }
);
