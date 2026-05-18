'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ChatMessage, SendChatMessageResponse } from '@/features/chat/domain/entities/Chat';
import { createChatSessionApi, sendChatMessageApi, endChatSessionApi } from '@/api/endpoints/chat';
import { useSiteContext } from '@/features/auth/application/hooks/useAuth';
import type { Device } from '@/features/device/domain/entities/Device';
import type { ApiError } from '@/shared/types/api';
import { extractApiError } from '@/shared/utils/api';

interface UseChatSessionReturn {
    messages: ChatMessage[];
    isPending: boolean;
    error: ApiError | null;
    sendMessage: (text: string) => Promise<void>;
    resetSession: () => Promise<void>;
}

function buildChatMessage(
    role: ChatMessage['role'],
    content: string,
    response?: SendChatMessageResponse,
): ChatMessage {
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role,
        content,
        createdAt: new Date().toISOString(),
        metadata: response
            ? {
                  emotion: response.emotion,
                  language: response.language,
                  category: response.category,
                  placeId: response.placeId,
                  placeName: response.placeName,
                  imageUrl: response.imageUrl,
                  deviceLatitude: response.deviceLatitude,
                  deviceLongitude: response.deviceLongitude,
                  answerLatitude: response.latitude,
                  answerLongitude: response.longitude,
              }
            : null,
    };
}

export function useChatSession(selectedDevice: Device | null): UseChatSessionReturn {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const { currentSiteId } = useSiteContext();
    const sessionIdRef = useRef<string | null>(null);
    const currentSiteIdRef = useRef<number | null>(currentSiteId);
    const selectedDeviceRef = useRef<Device | null>(selectedDevice);
    const sendingRef = useRef(false);

    sessionIdRef.current = sessionId;
    currentSiteIdRef.current = currentSiteId;
    selectedDeviceRef.current = selectedDevice;

    const endSession = useCallback(async (targetSessionId: string, siteId: number, deviceId: string) => {
        try {
            await endChatSessionApi(targetSessionId, { siteId, deviceId });
        } catch {
            // 세션 종료 실패는 조용히 처리 (사용자 플로우에 영향 없음)
        }
    }, []);

    const resetSession = useCallback(async () => {
        const currentSession = sessionIdRef.current;
        const siteId = currentSiteIdRef.current;
        const device = selectedDeviceRef.current;

        if (currentSession && siteId !== null && device) {
            await endSession(currentSession, siteId, device.deviceId);
        }
        setSessionId(null);
        setMessages([]);
        setError(null);
    }, [endSession]);

    // 사이트 또는 디바이스 변경 시 세션 자동 리셋
    useEffect(() => {
        if (sessionIdRef.current) {
            resetSession();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSiteId, selectedDevice?.deviceId]);

    // 언마운트 시 세션 종료
    useEffect(() => {
        return () => {
            const currentSession = sessionIdRef.current;
            const siteId = currentSiteIdRef.current;
            const device = selectedDeviceRef.current;
            if (currentSession && siteId !== null && device) {
                endSession(currentSession, siteId, device.deviceId);
            }
        };
    }, [endSession]);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim() || sendingRef.current) return;
            if (currentSiteId === null || !selectedDevice) return;

            sendingRef.current = true;
            setError(null);
            setIsPending(true);

            const userMessage = buildChatMessage('user', text);
            setMessages((previous) => [...previous, userMessage]);

            let capturedSessionId: string | null = null;

            try {
                let activeSessionId = sessionIdRef.current;

                if (!activeSessionId) {
                    const sessionResponse = await createChatSessionApi({
                        siteId: currentSiteId,
                        deviceId: selectedDevice.deviceId,
                    });
                    if (!sessionResponse.success) {
                        throw new Error(sessionResponse.error?.message ?? '세션 생성에 실패했습니다.');
                    }
                    activeSessionId = sessionResponse.data.sessionId;
                    setSessionId(activeSessionId);
                    sessionIdRef.current = activeSessionId;
                }

                capturedSessionId = activeSessionId;

                const messageResponse = await sendChatMessageApi(activeSessionId, {
                    siteId: currentSiteId,
                    deviceId: selectedDevice.deviceId,
                    message: text,
                    language: 'ko-KR',
                    latitude: selectedDevice.latitude,
                    longitude: selectedDevice.longitude,
                });

                if (!messageResponse.success) {
                    throw new Error(messageResponse.error?.message ?? 'AI 응답 수신에 실패했습니다.');
                }

                // 응답 대기 중 세션이 reset/변경됐으면 stale response 무시
                if (sessionIdRef.current !== capturedSessionId) return;

                const assistantMessage = buildChatMessage(
                    'assistant',
                    messageResponse.data.answer,
                    messageResponse.data,
                );
                setMessages((previous) => [...previous, assistantMessage]);
            } catch (err) {
                if (capturedSessionId !== null && sessionIdRef.current !== capturedSessionId) return;
                const apiError = extractApiError(err);
                setError(apiError);
                const errorMessage = buildChatMessage(
                    'assistant',
                    `AI 응답 실패: ${apiError.message}`,
                );
                setMessages((previous) => [...previous, errorMessage]);
            } finally {
                sendingRef.current = false;
                setIsPending(false);
            }
        },
        [currentSiteId, selectedDevice],
    );

    return { messages, isPending, error, sendMessage, resetSession };
}
