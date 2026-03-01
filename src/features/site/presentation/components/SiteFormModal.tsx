'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBuildingLibrary, HiOutlinePencilSquare, HiXMark } from 'react-icons/hi2';

/**
 * SiteFormModalProps
 */
interface SiteFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    initialName: string;
    onClose: () => void;
    onSubmit: (name: string) => void;
}

/**
 * 오버레이 애니메이션
 */
const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

/**
 * 모달 본체 애니메이션
 */
const modalVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, damping: 28, stiffness: 350 },
    },
    exit: {
        opacity: 0,
        y: 16,
        transition: { duration: 0.15, ease: 'easeIn' as const },
    },
};

/**
 * 관광지 생성/수정 모달
 *
 * 상위 컴포넌트에서 모달을 열 때마다 key를 변경하여 리마운트해야 초기값이 정상 반영
 */
export function SiteFormModal({ isOpen, mode, initialName, onClose, onSubmit }: SiteFormModalProps) {
    const [name, setName] = useState(initialName);
    const [error, setError] = useState('');

    const isCreateMode = mode === 'create';

    /** ESC 키로 닫기 */
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

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
                <div className="fixed inset-0 z-5000 flex items-center justify-center p-4">
                    {/* 오버레이 */}
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.15 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 will-change-[opacity]"
                    />

                    {/* 모달 본체 */}
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="siteFormTitle"
                        className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] will-change-transform"
                    >
                        {/* 헤더 */}
                        <div className="flex items-center gap-3 px-7 pt-7 pb-1">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                ${isCreateMode
                                    ? 'bg-linear-to-br from-orange-400 to-orange-600'
                                    : 'bg-linear-to-br from-blue-400 to-blue-600'
                                }
                            `}>
                                {isCreateMode
                                    ? <HiOutlineBuildingLibrary className="w-5 h-5 text-white" />
                                    : <HiOutlinePencilSquare className="w-5 h-5 text-white" />
                                }
                            </div>
                            <div className="flex-1">
                                <h3 id="siteFormTitle" className="text-lg font-bold text-slate-900">
                                    {isCreateMode ? '새 관광지 추가' : '관광지 수정'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {isCreateMode ? '새로운 관광지를 시스템에 등록합니다' : '관광지 이름을 변경합니다'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="모달 닫기"
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 
                                    hover:text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                <HiXMark className="w-5 h-5" />
                            </button>
                        </div>

                        {/* 구분선 */}
                        <div className="mx-7 mt-5 mb-0 h-px bg-slate-100" />

                        {/* 입력 폼 */}
                        <div className="px-7 pt-5 pb-2">
                            <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                                관광지 이름
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(event) => {
                                    setName(event.target.value);
                                    if (error) setError('');
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="예: 에버랜드, 경복궁, 제주 민속촌"
                                className={`w-full h-12 px-4 bg-slate-50 border rounded-xl text-sm font-medium text-slate-800 
                                    placeholder:text-slate-300 outline-none transition-all duration-150
                                    ${error
                                        ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                        : 'border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white'
                                    }
                                `}
                                autoFocus
                            />
                            <div className="h-5 mt-1.5">
                                {error && (
                                    <p className="text-xs font-medium text-red-500">{error}</p>
                                )}
                            </div>
                        </div>

                        {/* 버튼 영역 */}
                        <div className="flex items-center gap-3 px-7 pb-7">
                            <button
                                onClick={onClose}
                                className="flex-1 h-11 rounded-xl font-semibold text-sm text-slate-500 bg-slate-100 
                                    hover:bg-slate-200 transition-colors duration-150"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSubmitForm}
                                className={`flex-1 h-11 rounded-xl font-semibold text-sm text-white transition-colors duration-150
                                    ${isCreateMode
                                        ? 'bg-orange-500 hover:bg-orange-600'
                                        : 'bg-blue-500 hover:bg-blue-600'
                                    }
                                `}
                            >
                                {isCreateMode ? '관광지 추가' : '변경사항 저장'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
