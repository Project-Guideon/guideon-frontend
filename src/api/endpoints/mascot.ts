import { apiClient } from '../client';
import type { ApiResponse } from '@/shared/types/api';
import type {
    Mascot,
    CreateMascotRequest,
    UpdateMascotRequest,
    MascotGenerationStart,
    MascotGenerationStatus,
} from '@/features/mascot/domain/entities/Mascot';

/**
 * Mascot Image Upload 응답 타입
 */
export interface MascotImageResponse {
    imageUrl?: string;
    image_url?: string;
}

/**
 * Mascot API Endpoints (PLATFORM_ADMIN 전용)
 *
 * POST  /admin/sites/{siteId}/mascot                              - 생성
 * GET   /admin/sites/{siteId}/mascot                              - 조회
 * PATCH /admin/sites/{siteId}/mascot                              - 수정
 * POST  /admin/sites/{siteId}/mascot/image                        - 이미지 선업로드 (multipart)
 * POST  /admin/sites/{siteId}/mascot/generate                     - 3D 생성 시작 (JSON)
 * GET   /admin/sites/{siteId}/mascot/generate/{generationId}/status - 상태 폴링
 * GET   /admin/sites/{siteId}/mascot/generate/latest              - 최근 이력
 */

/**
 * 마스코트 생성 (site당 1개)
 */
export const createMascotApi = async (siteId: number, data: CreateMascotRequest) => {
    const response = await apiClient.post<ApiResponse<Mascot>>(
        `/admin/sites/${siteId}/mascot`,
        data,
    );
    return response.data;
};

/**
 * 마스코트 조회
 */
export const getMascotApi = async (siteId: number) => {
    const response = await apiClient.get<ApiResponse<Mascot>>(
        `/admin/sites/${siteId}/mascot`,
    );
    return response.data;
};

/**
 * 마스코트 수정 (null 필드 무시)
 */
export const updateMascotApi = async (siteId: number, data: UpdateMascotRequest) => {
    const response = await apiClient.patch<ApiResponse<Mascot>>(
        `/admin/sites/${siteId}/mascot`,
        data,
    );
    return response.data;
};

/**
 * 마스코트 이미지 선업로드 (multipart/form-data)
 * 반환된 imageUrl을 3D 생성 시작에 사용
 */
export const uploadMascotImageApi = async (siteId: number, imageFile: File) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await apiClient.post<ApiResponse<MascotImageResponse>>(
        `/admin/sites/${siteId}/mascot/image`,
        formData,
        { timeout: 30000 },
    );
    const raw = response.data.data;
    return {
        ...response.data,
        data: {
            imageUrl: raw.imageUrl ?? raw.image_url ?? '',
        },
    };
};

/**
 * 3D 모델 생성 시작 (JSON — image_url 전달)
 * uploadMascotImageApi에서 받은 imageUrl을 전달
 */
export const generateMascotModelApi = async (siteId: number, imageUrl: string) => {
    const response = await apiClient.post<ApiResponse<MascotGenerationStart>>(
        `/admin/sites/${siteId}/mascot/generate`,
        { image_url: imageUrl },
    );
    return response.data;
};

/**
 * 3D 생성 상태 폴링
 */
export const getMascotGenerationStatusApi = async (siteId: number, generationId: number) => {
    const response = await apiClient.get<ApiResponse<MascotGenerationStatus>>(
        `/admin/sites/${siteId}/mascot/generate/${generationId}/status`,
    );
    return response.data;
};

/**
 * 최근 3D 생성 이력 조회
 */
export const getMascotGenerationLatestApi = async (siteId: number) => {
    const response = await apiClient.get<ApiResponse<MascotGenerationStatus>>(
        `/admin/sites/${siteId}/mascot/generate/latest`,
    );
    return response.data;
};
