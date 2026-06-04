'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { CleanMeshResponse, CleanMeshStatus } from '@/features/mascot/domain/entities/Mascot';
import {
    getCleanMeshApi,
    startCleanMeshGenerationApi,
    getCleanMeshJobStatusApi,
} from '@/api/endpoints/mascot';

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_COUNT = 12; // 최대 60초 대기

export type CleanMeshPollState = 'idle' | 'polling' | 'ready' | 'timeout' | 'error';
export type CleanMeshJobState = 'idle' | 'uploading' | 'processing' | 'ready' | 'failed';

interface UseCleanMeshReturn {
    // ── 기존: generation 완료 후 자동 생성된 FBX 폴링 ──
    cleanMeshUrl: string | null;
    cleanMeshStatus: CleanMeshStatus | null;
    pollState: CleanMeshPollState;
    startPolling: () => void;
    refetch: () => Promise<void>;

    // ── 신규: 이미지 → 독립 FBX 생성 파이프라인 ──
    jobState: CleanMeshJobState;
    jobCleanMeshUrl: string | null;
    jobError: string | null;
    generateCleanMesh: (imageFile: File) => Promise<void>;
}

/**
 * Clean Mesh 훅
 *
 * [기존] generation completed=true 이후 서버가 비동기로 만든 FBX URL 폴링.
 * [신규] 이미지 파일 → Tripo image_to_model → 리깅 없는 FBX 독립 생성.
 */
export function useCleanMesh(siteId: number | null): UseCleanMeshReturn {
    // ── 기존 상태 ──
    const [cleanMeshUrl, setCleanMeshUrl] = useState<string | null>(null);
    const [cleanMeshStatus, setCleanMeshStatus] = useState<CleanMeshStatus | null>(null);
    const [pollState, setPollState] = useState<CleanMeshPollState>('idle');

    const pollCountRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── 신규 상태 ──
    const [jobState, setJobState] = useState<CleanMeshJobState>('idle');
    const [jobCleanMeshUrl, setJobCleanMeshUrl] = useState<string | null>(null);
    const [jobError, setJobError] = useState<string | null>(null);
    const [jobTaskId, setJobTaskId] = useState<string | null>(null);

    const jobPollCountRef = useRef(0);
    const jobTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const stopPolling = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const stopJobPolling = useCallback(() => {
        if (jobTimerRef.current) {
            clearTimeout(jobTimerRef.current);
            jobTimerRef.current = null;
        }
    }, []);

    // siteId 변경 시 전체 초기화
    useEffect(() => {
        stopPolling();
        stopJobPolling();
        setCleanMeshUrl(null);
        setCleanMeshStatus(null);
        setPollState('idle');
        pollCountRef.current = 0;
        setJobState('idle');
        setJobCleanMeshUrl(null);
        setJobError(null);
        setJobTaskId(null);
        jobPollCountRef.current = 0;
    }, [siteId, stopPolling, stopJobPolling]);

    // ─── 기존 폴링 로직 ───────────────────────────────────────────────────────

    const fetchOnce = useCallback(async (): Promise<CleanMeshResponse | null> => {
        if (!siteId) return null;
        try {
            const response = await getCleanMeshApi(siteId);
            return response.data;
        } catch {
            return null;
        }
    }, [siteId]);

    const schedulePoll = useCallback(() => {
        if (!siteId) return;

        timerRef.current = setTimeout(async () => {
            pollCountRef.current += 1;
            const data = await fetchOnce();

            if (!data) { setPollState('error'); stopPolling(); return; }
            setCleanMeshStatus(data.status);

            if (data.status === 'ready') {
                setCleanMeshUrl(data.cleanMeshUrl);
                setPollState('ready');
                stopPolling();
                return;
            }
            if (pollCountRef.current >= MAX_POLL_COUNT) {
                setPollState('timeout'); stopPolling(); return;
            }
            schedulePoll();
        }, POLL_INTERVAL_MS);
    }, [siteId, fetchOnce, stopPolling]);

    const startPolling = useCallback(() => {
        stopPolling();
        pollCountRef.current = 0;
        setPollState('polling');
        schedulePoll();
    }, [stopPolling, schedulePoll]);

    const refetch = useCallback(async () => {
        if (!siteId) return;
        stopPolling();
        setPollState('polling');
        pollCountRef.current = 0;
        const data = await fetchOnce();
        if (!data) { setPollState('error'); return; }
        setCleanMeshStatus(data.status);
        if (data.status === 'ready') {
            setCleanMeshUrl(data.cleanMeshUrl);
            setPollState('ready');
        } else {
            schedulePoll();
        }
    }, [siteId, fetchOnce, stopPolling, schedulePoll]);

    // ─── 신규: 독립 FBX 생성 파이프라인 ──────────────────────────────────────

    const scheduleJobPoll = useCallback((taskId: string) => {
        if (!siteId) return;

        jobTimerRef.current = setTimeout(async () => {
            jobPollCountRef.current += 1;
            try {
                const res = await getCleanMeshJobStatusApi(siteId, taskId);
                const { status, cleanMeshUrl: url } = res.data;

                if (status === 'ready' && url) {
                    setJobState('ready');
                    setJobCleanMeshUrl(url);
                    // 기존 cleanMeshUrl도 갱신 (카드 통합 표시용)
                    setCleanMeshUrl(url);
                    setPollState('ready');
                    stopJobPolling();
                    return;
                }
                if (status === 'failed') {
                    setJobState('failed');
                    setJobError('FBX 생성에 실패했습니다. 다시 시도해 주세요.');
                    stopJobPolling();
                    return;
                }
                if (jobPollCountRef.current >= MAX_POLL_COUNT) {
                    setJobState('failed');
                    setJobError('FBX 생성 시간이 초과됐습니다. 다시 시도해 주세요.');
                    stopJobPolling();
                    return;
                }
                scheduleJobPoll(taskId);
            } catch {
                setJobState('failed');
                setJobError('상태 조회 중 오류가 발생했습니다.');
                stopJobPolling();
            }
        }, POLL_INTERVAL_MS);
    }, [siteId, stopJobPolling]);

    /**
     * 이미지 파일 → 독립 clean-mesh FBX 생성 시작.
     * Tripo image_to_model만 실행 (rig 없음).
     */
    const generateCleanMesh = useCallback(async (imageFile: File) => {
        if (!siteId) return;

        stopJobPolling();
        setJobState('uploading');
        setJobError(null);
        setJobCleanMeshUrl(null);
        jobPollCountRef.current = 0;

        try {
            const res = await startCleanMeshGenerationApi(siteId, imageFile);
            const { taskId } = res.data;
            setJobTaskId(taskId);
            setJobState('processing');
            scheduleJobPoll(taskId);
        } catch (err: unknown) {
            const apiErr = err as { response?: { data?: { error?: { message?: string } } } };
            setJobState('failed');
            setJobError(apiErr.response?.data?.error?.message ?? '생성 시작에 실패했습니다.');
        }
    }, [siteId, stopJobPolling, scheduleJobPoll]);

    // jobTaskId 복원 후 폴링 재개 (페이지 새로고침 방어 불필요 — siteId 변경 시 초기화)
    useEffect(() => {
        if (jobTaskId && jobState === 'processing' && !jobTimerRef.current) {
            scheduleJobPoll(jobTaskId);
        }
        return () => stopJobPolling();
    }, [jobTaskId, jobState, scheduleJobPoll, stopJobPolling]);

    return {
        cleanMeshUrl,
        cleanMeshStatus,
        pollState,
        startPolling,
        refetch,
        jobState,
        jobCleanMeshUrl,
        jobError,
        generateCleanMesh,
    };
}
