'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineArrowDownTray,
    HiOutlineCpuChip,
    HiOutlineCheckCircle,
    HiOutlineExclamationTriangle,
    HiOutlineArrowPath,
    HiOutlineInformationCircle,
} from 'react-icons/hi2';
import { useCleanMesh } from '@/features/mascot/application/hooks/useCleanMesh';
import type { CleanMeshPollState } from '@/features/mascot/application/hooks/useCleanMesh';

interface MascotCleanMeshCardProps {
    siteId: number;
    /** 3D 생성 completed=true가 된 순간 true로 전환 — 폴링 자동 시작 트리거 */
    generationCompleted: boolean;
}

/**
 * [v5 신규] Mixamo 업로드용 Clean Mesh 다운로드 카드
 *
 * 마스코트 3D 생성 완료(completed=true) 이후 서버가 비동기로
 * 스켈레톤 제거 FBX를 생성합니다. 이 컴포넌트는 해당 FBX의 준비 상태를
 * 폴링하여 다운로드 버튼을 활성화하고, Mixamo 업로드 가이드를 제공합니다.
 */
export function MascotCleanMeshCard({ siteId, generationCompleted }: MascotCleanMeshCardProps) {
    const { cleanMeshUrl, pollState, startPolling, refetch } = useCleanMesh(siteId);

    // 생성 완료 시점에 자동으로 폴링 시작
    useEffect(() => {
        if (generationCompleted) {
            startPolling();
        }
        // generationCompleted가 true로 바뀌는 시점에만 실행
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generationCompleted]);

    // 생성이 완료된 적 없으면 (= rig 미완료) 회색 안내만 표시
    if (!generationCompleted && pollState === 'idle') {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <CardHeader />
                <div className="mt-4 flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                    <HiOutlineInformationCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    <p className="text-xs text-slate-400">3D 모델 생성 완료 후 사용 가능합니다.</p>
                </div>
                <MixamoGuide />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <CardHeader />

            <div className="mt-4">
                <AnimatePresence mode="wait">
                    {pollState === 'ready' && cleanMeshUrl && (
                        <ReadyState key="ready" cleanMeshUrl={cleanMeshUrl} />
                    )}
                    {(pollState === 'polling' || (pollState === 'idle' && generationCompleted)) && (
                        <PollingState key="polling" />
                    )}
                    {pollState === 'timeout' && (
                        <TimeoutState key="timeout" onRetry={refetch} />
                    )}
                    {pollState === 'error' && (
                        <ErrorState key="error" onRetry={refetch} />
                    )}
                </AnimatePresence>
            </div>

            <MixamoGuide />
        </div>
    );
}

/** 카드 상단 헤더 */
function CardHeader() {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <HiOutlineCpuChip className="w-5 h-5 text-violet-500" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-slate-800">Mixamo 업로드용 메쉬</h3>
                <p className="text-xs text-slate-400">
                    스켈레톤 제거 FBX — Mixamo 자동 리깅 전용
                </p>
            </div>
        </div>
    );
}

/** 준비 완료 상태 — 다운로드 버튼 활성화 */
function ReadyState({ cleanMeshUrl }: { cleanMeshUrl: string }) {
    const fileName = cleanMeshUrl.split('/').at(-1) ?? 'clean_mesh.fbx';

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
        >
            {/* 상태 뱃지 */}
            <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                    준비됨
                </span>
            </div>

            {/* 다운로드 버튼 */}
            <a
                href={cleanMeshUrl}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600 text-white font-bold text-sm rounded-xl px-5 py-3 shadow-lg shadow-violet-200 transition-all duration-200 active:scale-[0.98]"
            >
                <HiOutlineArrowDownTray className="w-4 h-4" />
                {fileName} 다운로드
            </a>
        </motion.div>
    );
}

/** 폴링 중 상태 — 스피너 */
function PollingState() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 bg-violet-50 rounded-xl px-4 py-3"
        >
            <div className="w-4 h-4 border-[2.5px] border-violet-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <p className="text-xs font-medium text-violet-700">FBX 생성 중... 잠시만 기다려 주세요.</p>
        </motion.div>
    );
}

/** 타임아웃 상태 — 새로고침 안내 */
function TimeoutState({ onRetry }: { onRetry: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 bg-amber-50 rounded-xl px-4 py-3"
        >
            <HiOutlineExclamationTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="text-xs font-medium text-amber-700">FBX 생성이 지연되고 있습니다.</p>
                <button
                    onClick={onRetry}
                    className="mt-2 flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                >
                    <HiOutlineArrowPath className="w-3.5 h-3.5" />
                    다시 확인하기
                </button>
            </div>
        </motion.div>
    );
}

/** 오류 상태 */
function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 bg-red-50 rounded-xl px-4 py-3"
        >
            <HiOutlineExclamationTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="text-xs font-medium text-red-700">FBX 상태 조회에 실패했습니다.</p>
                <button
                    onClick={onRetry}
                    className="mt-2 flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                    <HiOutlineArrowPath className="w-3.5 h-3.5" />
                    다시 시도
                </button>
            </div>
        </motion.div>
    );
}

/** Mixamo 사용 가이드 (항상 하단에 표시) */
function MixamoGuide() {
    return (
        <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 mb-2.5 uppercase tracking-wide">사용 방법</p>
            <ol className="space-y-1.5">
                {[
                    '위 FBX 파일을 mixamo.com에 업로드',
                    '자동 리깅 완료 후 애니메이션 5개 다운로드',
                    'Format: FBX Binary · Skin: Without Skin · 30fps',
                    '아래 "애니메이션 파일 설정"에서 GLB로 변환 후 업로드',
                ].map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <span className="text-[10px] font-black text-violet-400 bg-violet-50 rounded-full w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                            {index + 1}
                        </span>
                        <span className="text-xs text-slate-500 leading-tight">{step}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
}
