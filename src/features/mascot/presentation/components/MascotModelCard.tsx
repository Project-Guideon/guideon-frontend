'use client';

import { useState, useRef } from 'react';
import { HiOutlineCubeTransparent, HiOutlineArrowUpTray, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';
import type { Mascot, MascotGenerationStatus } from '@/features/mascot/domain/entities/Mascot';

interface MascotModelCardProps {
    mascot: Mascot;
    generation: MascotGenerationStatus | null;
    isGenerating: boolean;
    isPolling: boolean;
    onStartGeneration: (file: File) => Promise<boolean>;
}

/**
 * 3D 모델 생성 & 상태 카드
 */
export function MascotModelCard({
    mascot,
    generation,
    isGenerating,
    isPolling,
    onStartGeneration,
}: MascotModelCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleGenerate = async () => {
        if (!selectedFile) return;
        const success = await onStartGeneration(selectedFile);
        if (success) {
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    };

    const isInProgress = isPolling || isGenerating;
    const hasModel = !!mascot.modelUrl;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <HiOutlineCubeTransparent className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800">3D 모델</h3>
                    <p className="text-xs text-slate-400">Tripo AI 기반 자동 3D 생성</p>
                </div>
            </div>

            {/* 현재 모델 상태 */}
            {hasModel && (
                <div className="bg-green-50 rounded-xl p-4 mb-4 flex items-center gap-3">
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-green-700">3D 모델 적용 중</p>
                        <p className="text-xs text-green-600 truncate">{mascot.modelUrl}</p>
                    </div>
                </div>
            )}

            {/* 생성 진행 상태 */}
            {generation && !generation.completed && !generation.failed && (
                <div className="mb-4">
                    <GenerationProgress generation={generation} />
                </div>
            )}

            {/* 생성 실패 */}
            {generation?.failed && (
                <div className="bg-red-50 rounded-xl p-4 mb-4 flex items-start gap-3">
                    <HiOutlineXCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-700">3D 생성 실패</p>
                        {generation.failedReason && (
                            <p className="text-xs text-red-600 mt-1">{generation.failedReason}</p>
                        )}
                    </div>
                </div>
            )}

            {/* 이미지 업로드 영역 */}
            <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400">
                    {hasModel ? '새 모델 생성 (기존 모델 교체)' : '이미지로 3D 모델 생성'}
                </p>

                {/* 미리보기 + 파일 선택 */}
                <div
                    onClick={() => !isInProgress && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-all duration-200 ${
                        isInProgress
                            ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
                            : 'border-slate-200 hover:border-orange-400 cursor-pointer hover:bg-orange-50/30'
                    }`}
                >
                    {previewUrl ? (
                        <div className="relative aspect-video flex items-center justify-center bg-slate-50">
                            <img
                                src={previewUrl}
                                alt="업로드 미리보기"
                                className="max-h-48 object-contain"
                            />
                        </div>
                    ) : (
                        <div className="py-10 flex flex-col items-center gap-2">
                            <HiOutlineArrowUpTray className="w-8 h-8 text-slate-300" />
                            <p className="text-sm text-slate-500">PNG, JPG, WEBP 이미지를 선택하세요</p>
                            <p className="text-xs text-slate-400">클릭하여 파일 선택</p>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isInProgress}
                    />
                </div>

                {/* 생성 버튼 */}
                {selectedFile && !isInProgress && (
                    <button
                        onClick={handleGenerate}
                        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl px-5 py-3 shadow-lg shadow-orange-200 transition-all duration-200 active:scale-[0.98]"
                    >
                        <HiOutlineCubeTransparent className="w-4 h-4" />
                        3D 모델 생성 시작
                    </button>
                )}
            </div>
        </div>
    );
}

/**
 * 3D 생성 진행 단계 표시
 */
function GenerationProgress({ generation }: { generation: MascotGenerationStatus }) {
    const steps = [
        {
            label: '3D 모델 생성',
            status: generation.modelStatus,
        },
        {
            label: 'Auto Rigging',
            status: generation.rigStatus,
        },
    ];

    return (
        <div className="bg-orange-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 border-[2.5px] border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-orange-700">3D 모델 생성 중...</p>
            </div>
            <div className="space-y-2">
                {steps.map((step) => (
                    <div key={step.label} className="flex items-center gap-2.5">
                        <StepIndicator status={step.status} />
                        <span className={`text-xs font-medium ${
                            step.status === 'PROCESSING' ? 'text-orange-700' :
                            step.status === 'SUCCESS' ? 'text-green-600' :
                            step.status === 'FAILED' ? 'text-red-600' :
                            'text-slate-400'
                        }`}>
                            {step.label}
                        </span>
                        <span className="text-xs text-slate-400">
                            {step.status === 'PENDING' && '대기'}
                            {step.status === 'PROCESSING' && '진행 중...'}
                            {step.status === 'SUCCESS' && '완료'}
                            {step.status === 'FAILED' && '실패'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StepIndicator({ status }: { status: string }) {
    if (status === 'SUCCESS') {
        return <div className="w-2 h-2 rounded-full bg-green-500" />;
    }
    if (status === 'PROCESSING') {
        return <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />;
    }
    if (status === 'FAILED') {
        return <div className="w-2 h-2 rounded-full bg-red-500" />;
    }
    return <div className="w-2 h-2 rounded-full bg-slate-300" />;
}
