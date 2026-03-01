'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';
import type { Site } from '@/features/site/domain/entities/Site';

/**
 * SiteFormModalProps
 */
interface SiteFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    site: Site | null;
    onClose: () => void;
    onSubmit: (name: string) => void;
}

/**
 * SiteFormModal — 관광지 생성/수정 모달
 *
 * mode='create': 빈 폼으로 새 관광지 생성
 * mode='edit': 기존 관광지 이름을 수정
 */
export function SiteFormModal({ isOpen, mode, site, onClose, onSubmit }: SiteFormModalProps) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    // 모달 열릴 때 초기값 설정
    useEffect(() => {
        if (isOpen) {
            setName(mode === 'edit' && site ? site.name : '');
            setError('');
        }
    }, [isOpen, mode, site]);

    /** 폼 제출 핸들러 */
    const handleSubmitForm = () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            setError('관광지 이름을 입력해주세요.');
            return;
        }

        if (trimmedName.length > 100) {
            setError('관광지 이름은 100자 이내로 입력해주세요.');
            return;
        }

        onSubmit(trimmedName);
        onClose();
    };

    /** Enter 키 제출 */
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSubmitForm();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
                    {/* 오버레이 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* 모달 본체 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* 상단 장식 바 */}
                        <div className="h-2 w-full bg-orange-500" />

                        <div className="p-8">
                            {/* 헤더 */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-slate-800">
                                    {mode === 'create' ? '관광지 추가' : '관광지 수정'}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                                >
                                    <HiXMark className="w-6 h-6" />
                                </button>
                            </div>

                            {/* 입력 폼 */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-600 mb-2">
                                    관광지 이름 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(event) => {
                                        setName(event.target.value);
                                        if (error) setError('');
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="예: 경복궁"
                                    className={`w-full px-4 py-3 border rounded-xl text-sm font-medium text-slate-800 
                                        placeholder:text-slate-400 outline-none transition-all duration-200
                                        ${error
                                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                                            : 'border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-50 hover:border-orange-300'
                                        }
                                    `}
                                    autoFocus
                                />
                                {error && (
                                    <p className="mt-2 text-xs font-medium text-red-500">{error}</p>
                                )}
                            </div>

                            {/* 버튼 영역 */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-500 bg-slate-100 
                                        hover:bg-slate-200 transition-all duration-200 active:scale-[0.98]"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSubmitForm}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-orange-500 
                                        hover:bg-orange-600 shadow-lg shadow-orange-200 
                                        transition-all duration-200 active:scale-[0.98]"
                                >
                                    {mode === 'create' ? '추가' : '저장'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
