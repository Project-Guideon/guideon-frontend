/**
 * 마스코트 엔티티
 */
export interface Mascot {
    mascotId: number;
    siteId: number;
    name: string;
    modelId: string;
    defaultAnim: string;
    greetingMsg: string;
    systemPrompt: string;
    promptConfig: PromptConfig | null;
    ttsVoiceId: string;
    ttsVoiceJson: TtsVoiceConfig | null;
    modelUrl: string | null;
    modelFormat: string | null;
    generationId: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * 프롬프트 설정
 */
export interface PromptConfig {
    base_persona?: string;
    smalltalk_style?: string;
    answer_style?: string;
    [key: string]: string | undefined;
}

/**
 * TTS 음성 설정
 */
export interface TtsVoiceConfig {
    speed?: number;
    pitch?: number;
    [key: string]: number | undefined;
}

/**
 * 마스코트 생성 요청
 */
export interface CreateMascotRequest {
    name: string;
    modelId: string;
    defaultAnim?: string;
    greetingMsg: string;
    systemPrompt: string;
    promptConfig?: PromptConfig;
    ttsVoiceId?: string;
    ttsVoiceJson?: TtsVoiceConfig;
}

/**
 * 마스코트 수정 요청
 */
export interface UpdateMascotRequest {
    name?: string;
    modelId?: string;
    defaultAnim?: string;
    greetingMsg?: string;
    systemPrompt?: string;
    promptConfig?: PromptConfig;
    ttsVoiceId?: string;
    ttsVoiceJson?: TtsVoiceConfig;
    isActive?: boolean;
}

/**
 * 3D 생성 시작 응답
 */
export interface MascotGenerationStart {
    generationId: number;
    modelTaskId: string;
    status: string;
}

/**
 * 3D 생성 상태 (폴링 응답)
 */
export interface MascotGenerationStatus {
    generationId: number;
    sourceImageUrl: string;
    modelTaskId: string;
    modelStatus: GenerationStepStatus;
    rigTaskId: string | null;
    rigStatus: GenerationStepStatus;
    resultModelUrl: string | null;
    failedReason: string | null;
    completed: boolean;
    failed: boolean;
    createdAt: string;
    updatedAt: string;
}

export type GenerationStepStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

/**
 * 기본 애니메이션 옵션
 */
export const DEFAULT_ANIM_OPTIONS = [
    { value: 'IDLE_A', label: 'Idle A (기본)' },
    { value: 'IDLE_B', label: 'Idle B' },
    { value: 'WAVE', label: 'Wave (손 흔들기)' },
    { value: 'BOW', label: 'Bow (인사)' },
] as const;

/**
 * TTS 음성 옵션 (Deprecated: Cartesia 클로닝으로 대체됨)
 */
export const TTS_VOICE_OPTIONS = [
    { value: 'ko-KR-Wavenet-A', label: '한국어 여성 A' },
    { value: 'ko-KR-Wavenet-B', label: '한국어 여성 B' },
    { value: 'ko-KR-Wavenet-C', label: '한국어 남성 A' },
    { value: 'ko-KR-Wavenet-D', label: '한국어 남성 B' },
] as const;

/**
 * 음성 클로닝 결과
 */
export interface MascotVoiceCloneResult {
    voiceId: string;
    name: string;
}

export const VOICE_CLONE_ACCEPTED_EXTENSIONS = [
    '.wav', '.mp3', '.m4a', '.m4r', '.ogg', '.webm',
] as const;

export const VOICE_CLONE_ACCEPT_ATTRIBUTE = VOICE_CLONE_ACCEPTED_EXTENSIONS.join(',');
export const VOICE_CLONE_MAX_BYTES = 800 * 1024;
export const VOICE_CLONE_DEFAULT_LANGUAGE = 'ko';

/**
 * 마스코트 최초 생성 시 ttsVoiceId 자리에 사용하는 임시 기본값.
 * TTS 카드에서 음성 클로닝 완료 후 PATCH 로 실제 값으로 교체됩니다.
 */
export const PENDING_VOICE_ID = 'PENDING' as const;

/**
 * 마스코트 최초 생성 시 modelId 자리에 사용하는 임시 기본값.
 * 3D 모델 생성 완료 후 PATCH 로 실제 값으로 교체됩니다.
 */
export const PENDING_MODEL_ID = 'NONE' as const;
