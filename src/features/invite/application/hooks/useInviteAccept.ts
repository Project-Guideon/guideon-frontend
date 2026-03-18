'use client';

import { useState, useCallback } from 'react';
import { acceptInviteApi } from '@/api/endpoints/invite';
import { tokenStorage } from '@/api/client';
import type { InviteAcceptStatus, InviteErrorType } from '@/features/invite/domain/entities/Invite';

/**
 * 초대 수락 에러 메시지 매핑
 */
const ERROR_MESSAGES: Record<InviteErrorType, string> = {
    INVITE_EXPIRED: '초대가 만료되었습니다. 관리자에게 재발송을 요청해주세요.',
    INVITE_ALREADY_USED: '이미 수락된 초대입니다. 로그인 페이지에서 로그인해주세요.',
    VALIDATION_ERROR: '입력값을 확인해주세요.',
    NOT_FOUND: '유효하지 않은 초대 링크입니다.',
    UNKNOWN: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

/**
 * useInviteAccept - 초대 수락 비즈니스 로직 훅
 *
 * 토큰 기반 초대 수락 → 계정 생성 → JWT 저장
 */
export function useInviteAccept() {
    const [status, setStatus] = useState<InviteAcceptStatus>('idle');
    const [errorType, setErrorType] = useState<InviteErrorType | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    /**
     * 초대 수락 실행
     * 성공 시 JWT를 localStorage에 저장하고 true 반환
     */
    const acceptInvite = useCallback(async (token: string, password: string): Promise<boolean> => {
        setStatus('submitting');
        setErrorType(null);
        setErrorMessage(null);

        try {
            const response = await acceptInviteApi(token, { password });
            const data = response.data;

            tokenStorage.setTokens(data.access_token, data.refresh_token);
            setStatus('success');
            return true;
        } catch (error: unknown) {
            const apiError = error as {
                response?: { data?: { error?: { code?: string; message?: string } } };
            };
            const code = apiError.response?.data?.error?.code;
            const message = apiError.response?.data?.error?.message;

            let mappedErrorType: InviteErrorType = 'UNKNOWN';

            if (code === 'INVITE_EXPIRED') {
                mappedErrorType = 'INVITE_EXPIRED';
            } else if (code === 'INVITE_ALREADY_USED') {
                mappedErrorType = 'INVITE_ALREADY_USED';
            } else if (code === 'VALIDATION_ERROR') {
                mappedErrorType = 'VALIDATION_ERROR';
            } else if (code === 'NOT_FOUND') {
                mappedErrorType = 'NOT_FOUND';
            }

            setErrorType(mappedErrorType);
            setErrorMessage(message || ERROR_MESSAGES[mappedErrorType]);
            setStatus('error');
            return false;
        }
    }, []);

    /**
     * 에러 상태 초기화
     */
    const clearError = useCallback(() => {
        setErrorType(null);
        setErrorMessage(null);
        setStatus('idle');
    }, []);

    return {
        status,
        errorType,
        errorMessage,
        acceptInvite,
        clearError,
    };
}
