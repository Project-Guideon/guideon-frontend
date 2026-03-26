import type { ApiError } from '@/shared/types/api';

/** Axios 에러에서 ApiError 추출 헬퍼 */
export function extractApiError(err: unknown): ApiError {
    if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: ApiError } } };
        if (axiosError.response?.data?.error) {
            return axiosError.response.data.error;
        }
    }

    return {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
    };
}
