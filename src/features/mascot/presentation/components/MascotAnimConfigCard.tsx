'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCog6Tooth, HiOutlineArrowUpTray, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { useMascotAnimConfig } from '@/features/mascot/application/hooks/useMascotAnimConfig';

interface MascotAnimConfigCardProps {
    siteId: number;
}

const ANIM_STATES = [
    { key: 'idle', label: '대기 (Idle)' },
    { key: 'speaking', label: '말하기 (Speaking)' },
    { key: 'listening', label: '듣기 (Listening)' },
    { key: 'thinking', label: '생각 중 (Thinking)' },
    { key: 'greeting', label: '인사 (Greeting)' },
] as const;

/**
 * 사전 설정: 애니메이션 GLB 업로드 및 클립명 매핑
 */
export function MascotAnimConfigCard({ siteId }: MascotAnimConfigCardProps) {
    const { config, isLoading, isSaving, error, uploadAnimations, updateClipNames } = useMascotAnimConfig(siteId);

    // 파일 선택 상태
    const [selectedFiles, setSelectedFiles] = useState<Partial<Record<string, File>>>({});
    // 매핑 편집 모드 상태
    const [isEditingNames, setIsEditingNames] = useState(false);
    const [clipNamesForm, setClipNamesForm] = useState<Record<string, string>>({});

    const fileInputRefs = {
        idle: useRef<HTMLInputElement>(null),
        speaking: useRef<HTMLInputElement>(null),
        listening: useRef<HTMLInputElement>(null),
        thinking: useRef<HTMLInputElement>(null),
        greeting: useRef<HTMLInputElement>(null),
    };

    const handleFileSelect = (key: string, file: File | undefined) => {
        if (!file) return;
        setSelectedFiles((prev) => ({ ...prev, [key]: file }));
    };

    const handleRemoveFile = (key: string) => {
        setSelectedFiles((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
        if (fileInputRefs[key as keyof typeof fileInputRefs].current) {
            fileInputRefs[key as keyof typeof fileInputRefs].current!.value = '';
        }
    };

    const handleUploadAll = async () => {
        if (Object.keys(selectedFiles).length === 0) return;
        const success = await uploadAnimations(selectedFiles);
        if (success) {
            setSelectedFiles({});
        }
    };

    const handleEditStart = () => {
        setClipNamesForm(config?.animClips ?? {});
        setIsEditingNames(true);
    };

    const handleEditSave = async () => {
        const success = await updateClipNames(clipNamesForm);
        if (success) {
            setIsEditingNames(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex justify-center items-center h-40">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    const hasAnyFileSelected = Object.keys(selectedFiles).length > 0;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                        <HiOutlineCog6Tooth className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">애니메이션 사전 설정</h3>
                        <p className="text-xs text-slate-400">마스코트 생성 전 state별 GLB 등록 (최초 1회)</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 rounded-xl p-3 mb-4 flex items-start gap-2">
                    <HiOutlineExclamationTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">{error}</p>
                </div>
            )}

            {/* 업로드 폼 및 상태 목록 */}
            <div className="space-y-3">
                {ANIM_STATES.map(({ key, label }) => {
                    const isUploaded = !!config?.animGlbUrls?.[key];
                    const clipName = config?.animClips?.[key];
                    const selectedFile = selectedFiles[key];
                    const fileInputRef = fileInputRefs[key as keyof typeof fileInputRefs];

                    return (
                        <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700">{label}</span>
                                {isEditingNames ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-400">Clip:</span>
                                        <input
                                            type="text"
                                            className="text-xs px-2 py-1 rounded border border-slate-200 focus:outline-none focus:border-purple-400"
                                            value={clipNamesForm[key] || ''}
                                            onChange={(e) => setClipNamesForm((prev) => ({ ...prev, [key]: e.target.value }))}
                                            disabled={isSaving}
                                        />
                                    </div>
                                ) : (
                                    clipName && (
                                        <span className="text-xs text-purple-600 mt-0.5">
                                            Clip: <span className="font-medium">{clipName}</span>
                                        </span>
                                    )
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                {isUploaded && !selectedFile && (
                                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-lg text-xs font-bold">
                                        <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                                        등록됨
                                    </div>
                                )}
                                {selectedFile && (
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-slate-600 truncate max-w-[120px]">{selectedFile.name}</span>
                                        <button onClick={() => handleRemoveFile(key)} className="text-red-400 hover:text-red-600 font-bold">
                                            취소
                                        </button>
                                    </div>
                                )}
                                {!selectedFile && (
                                    <>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".glb"
                                            className="hidden"
                                            onChange={(e) => handleFileSelect(key, e.target.files?.[0])}
                                            disabled={isSaving}
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isSaving || isEditingNames}
                                            className="bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-600 hover:text-purple-600 font-medium text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                                        >
                                            {isUploaded ? '변경' : '파일 선택'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 액션 버튼 */}
            <div className="mt-5 flex items-center justify-end gap-2">
                {isEditingNames ? (
                    <>
                        <button
                            onClick={() => setIsEditingNames(false)}
                            disabled={isSaving}
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleEditSave}
                            disabled={isSaving}
                            className="px-4 py-2 text-xs font-bold text-white bg-purple-500 hover:bg-purple-600 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                        >
                            {isSaving ? '저장 중...' : '클립명 저장'}
                        </button>
                    </>
                ) : (
                    <>
                        {config?.animClips && Object.keys(config.animClips).length > 0 && !hasAnyFileSelected && (
                            <button
                                onClick={handleEditStart}
                                className="px-4 py-2 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all mr-auto"
                            >
                                클립명 매핑 수정
                            </button>
                        )}
                        {hasAnyFileSelected && (
                            <button
                                onClick={handleUploadAll}
                                disabled={isSaving}
                                className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-white bg-purple-500 hover:bg-purple-600 rounded-xl shadow-md shadow-purple-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <HiOutlineArrowUpTray className="w-4 h-4" />
                                {isSaving ? '업로드 중...' : '선택한 파일 일괄 업로드'}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
