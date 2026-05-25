'use client';

import { useState, useCallback, useRef } from 'react';
import type { ApiError } from '@/shared/types/api';
import type { MascotVoiceCloneResult } from '@/features/mascot/domain/entities/Mascot';
import {
    VOICE_CLONE_MAX_BYTES,
    VOICE_CLONE_ACCEPTED_EXTENSIONS,
    VOICE_CLONE_DEFAULT_LANGUAGE,
} from '@/features/mascot/domain/entities/Mascot';
import { cloneMascotVoiceApi } from '@/api/endpoints/mascot';
import { extractApiError } from '@/shared/utils/api';

interface UseMascotVoiceCloneReturn {
    cloneVoice: (file: File, name: string) => Promise<MascotVoiceCloneResult | null>;
    isCloning: boolean;
    error: ApiError | null;
    resetError: () => void;
}

export function useMascotVoiceClone(siteId: number | null): UseMascotVoiceCloneReturn {
    const [isCloning, setIsCloning] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);
    const cloningRef = useRef(false);

    const resetError = useCallback(() => setError(null), []);

    const cloneVoice = useCallback(async (
        file: File,
        name: string,
    ): Promise<MascotVoiceCloneResult | null> => {
        if (!siteId || cloningRef.current) return null;

        // 클라이언트 사전 검증
        const rawExtension = file.name.split('.').pop()?.toLowerCase() ?? '';
        const extension = `.${rawExtension}` as typeof VOICE_CLONE_ACCEPTED_EXTENSIONS[number];
        const isAccepted = (VOICE_CLONE_ACCEPTED_EXTENSIONS as readonly string[]).includes(extension);

        if (!isAccepted) {
            setError({
                code: 'VALIDATION_ERROR',
                message: `지원하지 않는 파일 형식입니다. (${VOICE_CLONE_ACCEPTED_EXTENSIONS.join(', ')})`,
            });
            return null;
        }
        if (file.size > VOICE_CLONE_MAX_BYTES) {
            setError({
                code: 'VALIDATION_ERROR',
                message: '파일이 너무 큽니다. 10초(약 800KB) 이하 파일을 사용해 주세요.',
            });
            return null;
        }
        if (!name.trim()) {
            setError({
                code: 'VALIDATION_ERROR',
                message: '보이스 이름을 입력해 주세요.',
            });
            return null;
        }

        cloningRef.current = true;
        setIsCloning(true);
        setError(null);

        try {
            const response = await cloneMascotVoiceApi(
                siteId,
                file,
                name.trim(),
                VOICE_CLONE_DEFAULT_LANGUAGE,
            );
            return response.data;
        } catch (err: unknown) {
            const apiError = extractApiError(err);
            const httpStatus = (err as { response?: { status?: number } })?.response?.status;

            if (httpStatus === 503) {
                setError({
                    ...apiError,
                    message: '음성 클로닝 서비스 설정이 필요합니다. 관리자에게 문의해 주세요.',
                });
            } else if (apiError.code === 'MASCOT_NOT_FOUND') {
                setError({ ...apiError, message: '마스코트를 먼저 등록해 주세요.' });
            } else if (apiError.code === 'VOICE_CLONE_FAILED') {
                setError({ ...apiError, message: '잠시 후 다시 시도해 주세요.' });
            } else if (apiError.code === 'VALIDATION_ERROR') {
                setError({
                    ...apiError,
                    message: '파일 형식이 올바르지 않거나 10초를 초과합니다.',
                });
            } else {
                setError(apiError);
            }
            return null;
        } finally {
            cloningRef.current = false;
            setIsCloning(false);
        }
    }, [siteId]);

    return { cloneVoice, isCloning, error, resetError };
}
