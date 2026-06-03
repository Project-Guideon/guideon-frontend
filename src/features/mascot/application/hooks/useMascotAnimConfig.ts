import { useState, useCallback, useEffect } from 'react';
import { getMascotAnimConfigApi, updateMascotAnimConfigApi, uploadMascotAnimationsApi } from '@/api/endpoints/mascot';
import type { AnimConfigResponse } from '@/features/mascot/domain/entities/Mascot';

export function useMascotAnimConfig(siteId: number | null) {
    const [config, setConfig] = useState<AnimConfigResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchConfig = useCallback(async () => {
        if (!siteId) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await getMascotAnimConfigApi(siteId);
            setConfig(res.data);
        } catch (err: unknown) {
            // 404 Not Found는 설정이 없는 정상이므로 에러로 처리하지 않음 (백엔드 구조에 따라 다를 수 있음)
            // 임시로 무시하고 config=null 유지
            const apiError = err as { response?: { status?: number, data?: { error?: { message?: string } } } };
            if (apiError.response?.status !== 404) {
                setError(apiError.response?.data?.error?.message ?? '애니메이션 설정을 불러오는데 실패했습니다.');
            } else {
                setConfig(null);
            }
        } finally {
            setIsLoading(false);
        }
    }, [siteId]);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const uploadAnimations = async (
        files: Partial<Record<'idle' | 'speaking' | 'listening' | 'thinking' | 'greeting', File>>
    ) => {
        if (!siteId) return false;
        setIsSaving(true);
        setError(null);
        try {
            await uploadMascotAnimationsApi(siteId, files);
            await fetchConfig();
            return true;
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { error?: { message?: string } } } };
            setError(apiError.response?.data?.error?.message ?? 'GLB 파일 업로드에 실패했습니다.');
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const updateClipNames = async (animClips: Record<string, string>) => {
        if (!siteId) return false;
        setIsSaving(true);
        setError(null);
        try {
            await updateMascotAnimConfigApi(siteId, animClips);
            await fetchConfig();
            return true;
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { error?: { message?: string } } } };
            setError(apiError.response?.data?.error?.message ?? '클립명 변경에 실패했습니다.');
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    return {
        config,
        isLoading,
        isSaving,
        error,
        fetchConfig,
        uploadAnimations,
        updateClipNames,
    };
}
