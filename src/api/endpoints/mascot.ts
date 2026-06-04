import { apiClient } from '../client';
import type { ApiResponse } from '@/shared/types/api';
import type {
    Mascot,
    CreateMascotRequest,
    UpdateMascotRequest,
    MascotGenerationStart,
    MascotGenerationStatus,
    MascotVoiceCloneResult,
    AnimationGlbsUploadResponse,
    AnimConfigResponse,
    AnimationUploadResponse,
    ModelUploadResponse,
    CleanMeshResponse,
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
 * GET   /admin/sites/{siteId}/mascot/clean-mesh                         - [v5 신규] Mixamo용 FBX 조회
 * POST  /admin/sites/{siteId}/mascot/animations                         - 사전설정: state별 GLB 업로드 (multipart)
 * GET   /admin/sites/{siteId}/mascot/anim-config                        - 사전설정: 현재 조회
 * PUT   /admin/sites/{siteId}/mascot/anim-config                        - 사전설정: 클립명 매핑 수정 (JSON)
 * POST  /admin/sites/{siteId}/mascot/model                               - base 모델 교체: 리깅 완료 GLB 직접 업로드 (multipart)
 * POST  /admin/sites/{siteId}/mascot/animation                          - 수동 오버라이드: 단일 anim GLB 업로드 (multipart)
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
 * [v5 신규] Clean Mesh 조회 (GET /mascot/clean-mesh)
 * completed=true 이후 서버가 비동기로 생성하는 Mixamo 업로드용 FBX URL을 반환합니다.
 * status=‘ready’일 때만 cleanMeshUrl이 non-null입니다.
 */
export const getCleanMeshApi = async (siteId: number) => {
    const response = await apiClient.get<ApiResponse<CleanMeshResponse>>(
        `/admin/sites/${siteId}/mascot/clean-mesh`,
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
 * 사전설정: 상태별 GLB 5개 업로드 (multipart/form-data)
 */
export const uploadMascotAnimationsApi = async (
    siteId: number,
    files: Partial<Record<'idle' | 'speaking' | 'listening' | 'thinking' | 'greeting', File>>
): Promise<ApiResponse<AnimationGlbsUploadResponse>> => {
    const formData = new FormData();
    Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(key, file);
    });

    const response = await apiClient.post<ApiResponse<AnimationGlbsUploadResponse>>(
        `/admin/sites/${siteId}/mascot/animations`,
        formData,
        { timeout: 300000 }, // 여러 개 업로드하므로 5분 넉넉히
    );
    return response.data;
};

/**
 * 사전설정: 현재 설정 조회
 */
export const getMascotAnimConfigApi = async (siteId: number) => {
    const response = await apiClient.get<ApiResponse<AnimConfigResponse>>(
        `/admin/sites/${siteId}/mascot/anim-config`,
    );
    return response.data;
};

/**
 * 사전설정: 클립명 매핑 수정
 */
export const updateMascotAnimConfigApi = async (
    siteId: number,
    animClips: Record<string, string>
) => {
    const response = await apiClient.put<ApiResponse<AnimConfigResponse>>(
        `/admin/sites/${siteId}/mascot/anim-config`,
        { animClips },
    );
    return response.data;
};

/**
 * base 모델 교체: 리깅 완료 GLB 직접 업로드 (POST /mascot/model)
 * - modelUrl 교체 + anim_config 기준 animModelUrl 자동 병합
 * - Tripo 파이프라인 없이 외부에서 준비한 GLB를 마스코트에 연결할 때 사용
 */
export const uploadMascotModelApi = async (
    siteId: number,
    file: File,
): Promise<ApiResponse<ModelUploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<ModelUploadResponse>>(
        `/admin/sites/${siteId}/mascot/model`,
        formData,
        { timeout: 120000 }, // 2분 (anim 병합까지 포함)
    );
    return response.data;
};

/**
 * 수동 오버라이드: 단일 anim GLB 업로드 (multipart/form-data)
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
        { timeout: 120000 }, // 2분
    );
    return response.data;
};

