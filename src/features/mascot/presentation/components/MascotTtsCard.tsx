'use client';

import { useState, useRef } from 'react';
import {
    HiOutlineMicrophone,
    HiOutlineArrowUpTray,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineSparkles,
} from 'react-icons/hi2';
import { useMascotVoiceClone } from '@/features/mascot/application/hooks/useMascotVoiceClone';
import { VOICE_CLONE_ACCEPT_ATTRIBUTE } from '@/features/mascot/domain/entities/Mascot';
import type { MascotTtsCardProps } from '@/features/mascot/presentation/types/MascotTtsCardProps';

export function MascotTtsCard({ mascot, siteId, onCloned }: MascotTtsCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [voiceName, setVoiceName] = useState('');

    const { cloneVoice, isCloning, error, resetError } = useMascotVoiceClone(siteId);

    const hasVoice = !!mascot.ttsVoiceId;
    const isReadyToSubmit = selectedFile !== null && voiceName.trim().length > 0;

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        resetError();
        setSelectedFile(file);
    };

    const handleClone = async () => {
        if (!selectedFile || isCloning) return;

        const result = await cloneVoice(selectedFile, voiceName);
        if (result) {
            setSelectedFile(null);
            setVoiceName('');
            if (fileInputRef.current) fileInputRef.current.value = '';
            await onCloned();
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            {/* 헤더 */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <HiOutlineMicrophone className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800">TTS 음성</h3>
                    <p className="text-xs text-slate-400">Cartesia 음성 클로닝</p>
                </div>
            </div>

            {/* 현재 음성 적용 상태 */}
            {hasVoice && (
                <div className="bg-green-50 rounded-xl p-4 mb-4 flex items-center gap-3">
                    <HiOutlineCheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-green-700">음성 적용 중</p>
                        <p className="text-xs text-green-600 truncate font-mono">{mascot.ttsVoiceId}</p>
                    </div>
                </div>
            )}

            {/* 에러 */}
            {error && (
                <div className="bg-red-50 rounded-xl p-4 mb-4 flex items-start gap-3">
                    <HiOutlineXCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-red-700">클로닝 실패</p>
                        <p className="text-xs text-red-600 mt-0.5">{error.message}</p>
                    </div>
                </div>
            )}

            {/* 클로닝 진행 중 안내 */}
            {isCloning && (
                <div className="bg-orange-50 rounded-xl p-4 mb-4 flex items-center gap-3">
                    <div className="w-4 h-4 border-[2.5px] border-orange-500 border-t-transparent rounded-full animate-spin shrink-0" />
                    <p className="text-sm font-medium text-orange-700">
                        Cartesia에서 음성을 생성 중입니다... (수십 초 소요)
                    </p>
                </div>
            )}

            <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400">
                    {hasVoice ? '새 음성으로 교체' : '음성 샘플로 클로닝'}
                </p>

                {/* 보이스 이름 입력 */}
                <input
                    type="text"
                    value={voiceName}
                    onChange={(event) => setVoiceName(event.target.value)}
                    placeholder="보이스 이름 (예: 해치 목소리)"
                    disabled={isCloning}
                    aria-label="보이스 이름"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {/* 파일 업로드 박스 */}
                <div
                    onClick={() => !isCloning && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-all duration-200 ${
                        isCloning
                            ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
                            : 'border-slate-200 hover:border-orange-400 cursor-pointer hover:bg-orange-50/30'
                    }`}
                >
                    {selectedFile ? (
                        <div className="py-6 flex flex-col items-center gap-1.5">
                            <HiOutlineMicrophone className="w-6 h-6 text-orange-400" />
                            <p className="text-sm font-medium text-slate-700">{selectedFile.name}</p>
                            <p className="text-xs text-slate-400">
                                {(selectedFile.size / 1024).toFixed(0)}KB
                            </p>
                        </div>
                    ) : (
                        <div className="py-10 flex flex-col items-center gap-2">
                            <HiOutlineArrowUpTray className="w-8 h-8 text-slate-300" />
                            <p className="text-sm text-slate-500">WAV, MP3, M4A, OGG, WEBM</p>
                            <p className="text-xs text-slate-400">클릭하여 음성 파일 선택 (최대 800KB)</p>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={VOICE_CLONE_ACCEPT_ATTRIBUTE}
                        onChange={handleFileSelect}
                        disabled={isCloning}
                        className="hidden"
                        aria-label="음성 파일 선택"
                    />
                </div>

                {/* 클로닝 버튼 */}
                {isReadyToSubmit && !isCloning && (
                    <button
                        onClick={handleClone}
                        aria-label="음성 클로닝 시작"
                        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl px-5 py-3 shadow-lg shadow-orange-200 transition-all duration-200 active:scale-[0.98]"
                    >
                        <HiOutlineSparkles className="w-4 h-4" />
                        음성 클로닝 시작
                    </button>
                )}
            </div>
        </div>
    );
}
