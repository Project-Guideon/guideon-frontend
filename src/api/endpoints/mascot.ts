import { apiClient } from '../client';
import type { ApiResponse } from '@/shared/types/api';
import type {
    Mascot,
    CreateMascotRequest,
    UpdateMascotRequest,
    MascotGenerationStart,
    MascotGenerationStatus,
    MascotVoiceCloneResult,
    AnimationUploadResponse,
} from '@/features/mascot/domain/entities/Mascot';
import { VOICE_CLONE_DEFAULT_LANGUAGE } from '@/features/mascot/domain/entities/Mascot';

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
 * POST  /admin/sites/{siteId}/mascot                                    - 생성
 * GET   /admin/sites/{siteId}/mascot                                    - 조회
 * PATCH /admin/sites/{siteId}/mascot                                    - 수정
 * POST  /admin/sites/{siteId}/mascot/image                              - 이미지 선업로드 (multipart)
 * POST  /admin/sites/{siteId}/mascot/generate                           - 3D 생성 시작 (JSON)
 * GET   /admin/sites/{siteId}/mascot/generate/{generationId}/status     - 상태 폴링
 * GET   /admin/sites/{siteId}/mascot/generate/latest                    - 최근 이력
 * POST  /admin/sites/{siteId}/mascot/animation                          - Mixamo anim GLB 업로드 (multipart)
 * POST  /admin/sites/{siteId}/mascot/voice/clone                        - Cartesia 음성 클로닝 (multipart)
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

/**
 * Cartesia 음성 클로닝 (multipart/form-data)
 * Content-Type 헤더는 Axios가 FormData를 감지해 자동 설정 — 직접 지정 금지
 */
export const cloneMascotVoiceApi = async (
    siteId: number,
    file: File,
    name: string,
    language: string = VOICE_CLONE_DEFAULT_LANGUAGE,
): Promise<ApiResponse<MascotVoiceCloneResult>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('language', language);

    const response = await apiClient.post<ApiResponse<MascotVoiceCloneResult>>(
        `/admin/sites/${siteId}/mascot/voice/clone`,
        formData,
        { timeout: 60000 },
    );
    return response.data;
};

/**
 * Mixamo anim GLB 업로드 (multipart/form-data)
 */
export const uploadMascotAnimationApi = async (
    siteId: number,
    file: File,
    animClips?: Record<string, string>,
): Promise<ApiResponse<AnimationUploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (animClips) {
        formData.append('animClips', JSON.stringify(animClips));
    }

    const response = await apiClient.post<ApiResponse<AnimationUploadResponse>>(
        `/admin/sites/${siteId}/mascot/animation`,
        formData,
        { timeout: 120000 }, // GLB 파일 업로드 고려 여유있게 2분
    );
    return response.data;
};
