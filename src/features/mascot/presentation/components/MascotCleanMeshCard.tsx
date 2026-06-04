'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineArrowDownTray,
    HiOutlineCpuChip,
    HiOutlineCheckCircle,
    HiOutlineExclamationTriangle,
    HiOutlineArrowPath,
    HiOutlineArrowUpTray,
    HiOutlinePhoto,
} from 'react-icons/hi2';
import { useCleanMesh } from '@/features/mascot/application/hooks/useCleanMesh';
import type { CleanMeshPollState, CleanMeshJobState } from '@/features/mascot/application/hooks/useCleanMesh';

interface MascotCleanMeshCardProps {
    siteId: number;
    /** 3D 생성 completed=true가 된 순간 true로 전환 — 기존 폴링 트리거 */
    generationCompleted: boolean;
}

/**
 * Mixamo 업로드용 Clean Mesh 카드
 *
 * [기존] full generation 완료 후 자동 생성된 FBX 다운로드
 * [신규] 이미지 직접 업로드 → Tripo image_to_model → 리깅 없는 FBX 독립 생성
 */
export function MascotCleanMeshCard({ siteId, generationCompleted }: MascotCleanMeshCardProps) {
    const {
        cleanMeshUrl,
        pollState,
        startPolling,
        refetch,
        jobState,
        jobCleanMeshUrl,
        jobError,
        generateCleanMesh,
    } = useCleanMesh(siteId);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // generation completed 시 기존 FBX 폴링 트리거
    useEffect(() => {
        if (generationCompleted) startPolling();
    }, [generationCompleted, startPolling]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleGenerate = async () => {
        if (!selectedFile) return;
        await generateCleanMesh(selectedFile);
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const isJobBusy = jobState === 'uploading' || jobState === 'processing';

    // 최종 표시할 FBX URL — 독립 생성이 있으면 우선, 없으면 기존 generation 결과
    const displayUrl = jobCleanMeshUrl ?? cleanMeshUrl;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <CardHeader />

            {/* ── 이미지 업로드 섹션 (독립 생성) ── */}
            <div className="mt-5 space-y-3">
                <p className="text-xs font-bold text-slate-500">이미지로 FBX 직접 생성</p>

                {/* 이미지 드롭존 */}
                <div
                    onClick={() => !isJobBusy && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-all duration-200 ${
                        isJobBusy
                            ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
                            : 'border-slate-200 hover:border-violet-400 cursor-pointer hover:bg-violet-50/30'
                    }`}
                >
                    {previewUrl ? (
                        <div className="aspect-video flex items-center justify-center bg-slate-50">
                            <img src={previewUrl} alt="미리보기" className="max-h-36 object-contain" />
                        </div>
                    ) : (
                        <div className="py-8 flex flex-col items-center gap-2">
                            <HiOutlinePhoto className="w-7 h-7 text-slate-300" />
                            <p className="text-sm text-slate-400">PNG, JPG, WEBP 이미지 선택</p>
                            <p className="text-xs text-slate-400">클릭하여 파일 선택</p>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isJobBusy}
                    />
                </div>

                {/* 생성 버튼 */}
                {selectedFile && !isJobBusy && (
                    <button
                        onClick={handleGenerate}
                        className="w-full flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600 text-white font-bold text-sm rounded-xl px-5 py-3 shadow-lg shadow-violet-200 transition-all active:scale-[0.98]"
                    >
                        <HiOutlineArrowUpTray className="w-4 h-4" />
                        리깅 없는 FBX 생성
                    </button>
                )}

                {/* 독립 생성 진행 상태 */}
                <AnimatePresence mode="wait">
                    {(jobState === 'uploading' || jobState === 'processing') && (
                        <motion.div
                            key="job-processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 bg-violet-50 rounded-xl px-4 py-3"
                        >
                            <div className="w-4 h-4 border-[2.5px] border-violet-400 border-t-transparent rounded-full animate-spin shrink-0" />
                            <p className="text-xs font-medium text-violet-700">
                                {jobState === 'uploading' ? '이미지 업로드 중...' : '3D 모델 생성 중... (최대 60초)'}
                            </p>
                        </motion.div>
                    )}
                    {jobState === 'failed' && (
                        <motion.div
                            key="job-failed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start gap-3 bg-red-50 rounded-xl px-4 py-3"
                        >
                            <HiOutlineExclamationTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs font-medium text-red-700">{jobError}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── FBX 다운로드 섹션 ── */}
            {displayUrl && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-500 mb-3">생성된 FBX</p>
                    <ReadyState cleanMeshUrl={displayUrl} />
                </div>
            )}

            {/* 기존 폴링 상태 (generation 완료 후 자동 생성 대기 중인 경우) */}
            {!displayUrl && pollState === 'polling' && (
                <div className="mt-4">
                    <LegacyPollingState />
                </div>
            )}
            {!displayUrl && pollState === 'timeout' && (
                <div className="mt-4">
                    <TimeoutState onRetry={refetch} />
                </div>
            )}
            {!displayUrl && pollState === 'error' && (
                <div className="mt-4">
                    <ErrorState onRetry={refetch} />
                </div>
            )}

            <MixamoGuide />
        </div>
    );
}

function CardHeader() {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                <HiOutlineCpuChip className="w-5 h-5 text-violet-500" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-slate-800">Mixamo 업로드용 메쉬</h3>
                <p className="text-xs text-slate-400">스켈레톤 제거 FBX — Mixamo 자동 리깅 전용</p>
            </div>
        </div>
    );
}

function ReadyState({ cleanMeshUrl }: { cleanMeshUrl: string }) {
    const fileName = cleanMeshUrl.split('/').at(-1) ?? 'clean_mesh.fbx';
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
        >
            <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                    준비됨
                </span>
            </div>
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

function LegacyPollingState() {
    return (
        <div className="flex items-center gap-3 bg-violet-50 rounded-xl px-4 py-3">
            <div className="w-4 h-4 border-[2.5px] border-violet-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <p className="text-xs font-medium text-violet-700">FBX 생성 중... 잠시만 기다려 주세요.</p>
        </div>
    );
}

function TimeoutState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex items-start gap-3 bg-amber-50 rounded-xl px-4 py-3">
            <HiOutlineExclamationTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="text-xs font-medium text-amber-700">FBX 생성이 지연되고 있습니다.</p>
                <button onClick={onRetry} className="mt-2 flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                    <HiOutlineArrowPath className="w-3.5 h-3.5" />
                    다시 확인하기
                </button>
            </div>
        </div>
    );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex items-start gap-3 bg-red-50 rounded-xl px-4 py-3">
            <HiOutlineExclamationTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="text-xs font-medium text-red-700">FBX 상태 조회에 실패했습니다.</p>
                <button onClick={onRetry} className="mt-2 flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
                    <HiOutlineArrowPath className="w-3.5 h-3.5" />
                    다시 시도
                </button>
            </div>
        </div>
    );
}

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
