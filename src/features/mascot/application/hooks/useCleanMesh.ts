'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { CleanMeshResponse, CleanMeshStatus } from '@/features/mascot/domain/entities/Mascot';
import { getCleanMeshApi } from '@/api/endpoints/mascot';

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_COUNT = 12; // 최대 60초 대기

export type CleanMeshPollState = 'idle' | 'polling' | 'ready' | 'timeout' | 'error';

interface UseCleanMeshReturn {
    cleanMeshUrl: string | null;
    cleanMeshStatus: CleanMeshStatus | null;
    pollState: CleanMeshPollState;
    startPolling: () => void;
    refetch: () => Promise<void>;
}

/**
 * Clean Mesh 상태 폴링 훅 (v5 신규)
 *
 * 마스코트 3D 생성 completed=true 이후 호출합니다.
 * 서버가 비동기로 스켈레톤 제거 FBX를 생성하므로, ready 상태가 될 때까지 폴링합니다.
 *
 * pollState:
 *   - idle    : 폴링 미시작 (초기 상태)
 *   - polling : 서버 응답 대기 중 (스피너 표시)
 *   - ready   : FBX 준비 완료 (다운로드 버튼 활성화)
 *   - timeout : 60초 초과 후에도 미준비 (새로고침 안내)
 *   - error   : API 호출 실패
 */
export function useCleanMesh(siteId: number | null): UseCleanMeshReturn {
    const [cleanMeshUrl, setCleanMeshUrl] = useState<string | null>(null);
    const [cleanMeshStatus, setCleanMeshStatus] = useState<CleanMeshStatus | null>(null);
    const [pollState, setPollState] = useState<CleanMeshPollState>('idle');

    const pollCountRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const stopPolling = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // siteId 변경 시 상태 초기화
    useEffect(() => {
        stopPolling();
        setCleanMeshUrl(null);
        setCleanMeshStatus(null);
        setPollState('idle');
        pollCountRef.current = 0;
    }, [siteId, stopPolling]);

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

            if (!data) {
                setPollState('error');
                stopPolling();
                return;
            }

            setCleanMeshStatus(data.status);

            if (data.status === 'ready') {
                setCleanMeshUrl(data.cleanMeshUrl);
                setPollState('ready');
                stopPolling();
                return;
            }

            if (pollCountRef.current >= MAX_POLL_COUNT) {
                setPollState('timeout');
                stopPolling();
                return;
            }

            // 아직 not_available — 다음 폴링 예약
            schedulePoll();
        }, POLL_INTERVAL_MS);
    }, [siteId, fetchOnce, stopPolling]);

    /**
     * 폴링 시작
     * guard 없이 항상 초기화 후 재시작합니다.
     * → 재생성(두번째 이후) 시에도 새 FBX를 올바르게 폴링합니다.
     */
    const startPolling = useCallback(() => {
        stopPolling();
        pollCountRef.current = 0;
        setPollState('polling');
        schedulePoll();
    }, [stopPolling, schedulePoll]);

    /**
     * 수동 즉시 재조회 (새로고침 버튼 등에서 호출)
     */
    const refetch = useCallback(async () => {
        if (!siteId) return;
        stopPolling();
        setPollState('polling');
        pollCountRef.current = 0;

        const data = await fetchOnce();
        if (!data) {
            setPollState('error');
            return;
        }

        setCleanMeshStatus(data.status);

        if (data.status === 'ready') {
            setCleanMeshUrl(data.cleanMeshUrl);
            setPollState('ready');
        } else {
            schedulePoll();
        }
    }, [siteId, fetchOnce, stopPolling, schedulePoll]);

    return {
        cleanMeshUrl,
        cleanMeshStatus,
        pollState,
        startPolling,
        refetch,
    };
}
