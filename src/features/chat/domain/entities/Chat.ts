/**
 * Chat 도메인 엔티티
 *
 * Admin RAG LLM 채팅 테스트 기능에 사용되는 타입 정의
 */

export type ChatMessageRole = 'user' | 'assistant';

export interface ChatMessageMetadata {
    emotion: string | null;
    language: string | null;
    category: string | null;
    placeId: number | null;
    placeName: string | null;
    imageUrl: string | null;
    deviceLatitude: number | null;
    deviceLongitude: number | null;
    answerLatitude: number | null;
    answerLongitude: number | null;
}

export interface ChatMessage {
    id: string;
    role: ChatMessageRole;
    content: string;
    createdAt: string;
    metadata: ChatMessageMetadata | null;
}

export interface CreateChatSessionRequest {
    siteId: number;
    deviceId: string;
}

export interface CreateChatSessionResponse {
    sessionId: string;
}

export interface SendChatMessageRequest {
    siteId: number;
    deviceId: string;
    message: string;
    language: string;
    latitude?: number;
    longitude?: number;
}

export interface SendChatMessageResponse {
    sessionId: string;
    answer: string;
    emotion: string | null;
    language: string | null;
    category: string | null;
    deviceLatitude: number | null;
    deviceLongitude: number | null;
    placeId: number | null;
    placeName: string | null;
    imageUrl: string | null;
    latitude: number | null;
    longitude: number | null;
}

export interface EndChatSessionRequest {
    siteId: number;
    deviceId: string;
}
