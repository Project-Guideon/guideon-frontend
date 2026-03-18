'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
    Mascot,
    CreateMascotRequest,
    UpdateMascotRequest,
    MascotGenerationStatus,
} from '@/features/mascot/domain/entities/Mascot';
import {
    getMascotApi,
    createMascotApi,
    updateMascotApi,
    generateMascotModelApi,
    getMascotGenerationStatusApi,
    getMascotGenerationLatestApi,
} from '@/api/endpoints/mascot';

const POLLING_INTERVAL = 7000;

interface UseMascotReturn {
    mascot: Mascot | null;
    generation: MascotGenerationStatus | null;
    isLoading: boolean;
    isSaving: boolean;
    isGenerating: boolean;
    isPolling: boolean;
    error: string | null;
    notFound: boolean;
    fetchMascot: () => Promise<void>;
    createMascot: (data: CreateMascotRequest) => Promise<boolean>;
    updateMascot: (data: UpdateMascotRequest) => Promise<boolean>;
    startGeneration: (imageFile: File) => Promise<boolean>;
    clearError: () => void;
}

/**
 * 마스코트 CRUD + 3D 생성 폴링 훅
 */
export function useMascot(siteId: number | null): UseMascotReturn {
    const [mascot, setMascot] = useState<Mascot | null>(null);
    const [generation, setGeneration] = useState<MascotGenerationStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearError = useCallback(() => setError(null), []);

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        setIsPolling(false);
    }, []);

    /**
     * 마스코트 조회
     */
    const fetchMascot = useCallback(async () => {
        if (!siteId) return;
        setIsLoading(true);
        setError(null);
        setNotFound(false);

        try {
            const response = await getMascotApi(siteId);
            setMascot(response.data);

            // 최근 3D 생성 이력도 함께 조회
            try {
                const genResponse = await getMascotGenerationLatestApi(siteId);
                setGeneration(genResponse.data);
            } catch {
                setGeneration(null);
            }
        } catch (error: unknown) {
            const apiError = error as { response?: { data?: { error?: { code?: string } } } };
            const code = apiError.response?.data?.error?.code;
            if (code === 'MASCOT_NOT_FOUND') {
                setNotFound(true);
                setMascot(null);
            } else {
                setError('마스코트 정보를 불러오는 데 실패했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [siteId]);

    /**
     * 마스코트 생성
     */
    const createMascot = useCallback(async (data: CreateMascotRequest): Promise<boolean> => {
        if (!siteId) return false;
        setIsSaving(true);
        setError(null);

        try {
            const response = await createMascotApi(siteId, data);
            setMascot(response.data);
            setNotFound(false);
            return true;
        } catch (error: unknown) {
            const apiError = error as { response?: { data?: { error?: { code?: string; message?: string } } } };
            const code = apiError.response?.data?.error?.code;
            if (code === 'MASCOT_ALREADY_EXISTS') {
                setError('이미 마스코트가 등록된 관광지입니다.');
            } else {
                setError(apiError.response?.data?.error?.message ?? '마스코트 생성에 실패했습니다.');
            }
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [siteId]);

    /**
     * 마스코트 수정
     */
    const updateMascot = useCallback(async (data: UpdateMascotRequest): Promise<boolean> => {
        if (!siteId) return false;
        setIsSaving(true);
        setError(null);

        try {
            const response = await updateMascotApi(siteId, data);
            setMascot(response.data);
            return true;
        } catch (error: unknown) {
            const apiError = error as { response?: { data?: { error?: { message?: string } } } };
            setError(apiError.response?.data?.error?.message ?? '마스코트 수정에 실패했습니다.');
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [siteId]);

    /**
     * 3D 생성 상태 폴링
     */
    const pollGenerationStatus = useCallback(async (generationId: number) => {
        if (!siteId) return;

        try {
            const response = await getMascotGenerationStatusApi(siteId, generationId);
            setGeneration(response.data);

            if (response.data.completed || response.data.failed) {
                stopPolling();
                // 완료 시 마스코트 정보 갱신 (model_url 반영)
                if (response.data.completed) {
                    await fetchMascot();
                }
            }
        } catch {
            stopPolling();
        }
    }, [siteId, stopPolling, fetchMascot]);

    /**
     * 3D 모델 생성 시작
     */
    const startGeneration = useCallback(async (imageFile: File): Promise<boolean> => {
        if (!siteId) return false;
        setIsGenerating(true);
        setError(null);

        try {
            const response = await generateMascotModelApi(siteId, imageFile);
            const generationId = response.data.generationId;

            setGeneration({
                generationId,
                sourceImageUrl: '',
                modelTaskId: response.data.modelTaskId,
                modelStatus: 'PROCESSING',
                rigTaskId: null,
                rigStatus: 'PENDING',
                resultModelUrl: null,
                failedReason: null,
                completed: false,
                failed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            // 폴링 시작
            setIsPolling(true);
            pollingRef.current = setInterval(() => {
                pollGenerationStatus(generationId);
            }, POLLING_INTERVAL);

            return true;
        } catch (error: unknown) {
            const apiError = error as { response?: { data?: { error?: { code?: string; message?: string } } } };
            const code = apiError.response?.data?.error?.code;
            if (code === 'TRIPO_API_ERROR') {
                setError('3D 생성 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
            } else {
                setError(apiError.response?.data?.error?.message ?? '3D 모델 생성에 실패했습니다.');
            }
            return false;
        } finally {
            setIsGenerating(false);
        }
    }, [siteId, pollGenerationStatus]);

    // siteId 변경 시 마스코트 조회
    useEffect(() => {
        if (siteId) {
            fetchMascot();
        }
    }, [siteId, fetchMascot]);

    // 진행 중인 generation이 있으면 폴링 재개
    useEffect(() => {
        if (generation && !generation.completed && !generation.failed && !pollingRef.current) {
            setIsPolling(true);
            pollingRef.current = setInterval(() => {
                pollGenerationStatus(generation.generationId);
            }, POLLING_INTERVAL);
        }

        return () => stopPolling();
    }, [generation, pollGenerationStatus, stopPolling]);

    return {
        mascot,
        generation,
        isLoading,
        isSaving,
        isGenerating,
        isPolling,
        error,
        notFound,
        fetchMascot,
        createMascot,
        updateMascot,
        startGeneration,
        clearError,
    };
}
