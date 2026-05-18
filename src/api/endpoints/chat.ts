import { apiClient } from '../client';
import type { ApiResponse } from '@/shared/types/api';
import type {
    CreateChatSessionRequest,
    CreateChatSessionResponse,
    SendChatMessageRequest,
    SendChatMessageResponse,
    EndChatSessionRequest,
} from '@/features/chat/domain/entities/Chat';

/**
 * 백엔드 채팅 메시지 응답 원본 타입 (snake_case/camelCase 혼재 대응)
 */
interface RawSendChatMessageResponse {
    sessionId?: string;
    session_id?: string;
    answer: string;
    emotion?: string | null;
    language?: string | null;
    category?: string | null;
    deviceLatitude?: number | null;
    device_latitude?: number | null;
    deviceLongitude?: number | null;
    device_longitude?: number | null;
    placeId?: number | null;
    place_id?: number | null;
    placeName?: string | null;
    place_name?: string | null;
    imageUrl?: string | null;
    image_url?: string | null;
    latitude?: number | null;
    longitude?: number | null;
}

/**
 * 백엔드 응답을 프론트 엔티티로 정규화
 */
function toChatMessageResponse(raw: RawSendChatMessageResponse): SendChatMessageResponse {
    const sessionId = raw.sessionId ?? raw.session_id;
    if (!sessionId) {
        throw new Error('Invalid chat response: missing sessionId');
    }
    return {
        sessionId,
        answer: raw.answer,
        emotion: raw.emotion ?? null,
        language: raw.language ?? null,
        category: raw.category ?? null,
        deviceLatitude: raw.deviceLatitude ?? raw.device_latitude ?? null,
        deviceLongitude: raw.deviceLongitude ?? raw.device_longitude ?? null,
        placeId: raw.placeId ?? raw.place_id ?? null,
        placeName: raw.placeName ?? raw.place_name ?? null,
        imageUrl: raw.imageUrl ?? raw.image_url ?? null,
        latitude: raw.latitude ?? null,
        longitude: raw.longitude ?? null,
    };
}

/**
 * Chat API Endpoints
 *
 * POST /api/v1/admin/chat/sessions                        - 세션 생성
 * POST /api/v1/admin/chat/sessions/{sessionId}/messages   - 메시지 전송
 * POST /api/v1/admin/chat/sessions/{sessionId}/end        - 세션 종료
 */

/** 채팅 세션 생성 */
export const createChatSessionApi = async (
    body: CreateChatSessionRequest,
): Promise<ApiResponse<CreateChatSessionResponse>> => {
    const response = await apiClient.post<ApiResponse<CreateChatSessionResponse>>(
        '/admin/chat/sessions',
        body,
    );
    return response.data;
};

/** 채팅 메시지 전송 (AI 응답까지 최대 90초 소요) */
export const sendChatMessageApi = async (
    sessionId: string,
    body: SendChatMessageRequest,
): Promise<ApiResponse<SendChatMessageResponse>> => {
    const response = await apiClient.post<ApiResponse<RawSendChatMessageResponse>>(
        `/admin/chat/sessions/${sessionId}/messages`,
        body,
        { timeout: 90000 },
    );
    return {
        ...response.data,
        data: toChatMessageResponse(response.data.data),
    };
};

/** 채팅 세션 종료 */
export const endChatSessionApi = async (
    sessionId: string,
    body: EndChatSessionRequest,
): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(
        `/admin/chat/sessions/${sessionId}/end`,
        body,
    );
    return response.data;
};
