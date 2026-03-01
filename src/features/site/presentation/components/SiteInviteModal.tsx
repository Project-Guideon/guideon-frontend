'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineEnvelope, HiXMark } from 'react-icons/hi2';

/**
 * SiteInviteModalProps
 */
interface SiteInviteModalProps {
    isOpen: boolean;
    siteName: string;
    onClose: () => void;
    onSubmit: (email: string) => void;
}

/**
 * 오버레이 & 모달 애니메이션
 */
const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

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
 * 관광지에 운영자를 초대하는 모달
 *
 * 이메일 입력
 *
 * key 패턴으로 열 때마다 리마운트하여 초기값 보장
 */
export function SiteInviteModal({ isOpen, siteName, onClose, onSubmit }: SiteInviteModalProps) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    /** 이메일 유효성 검사 */
    const validateEmail = (value: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    /** 폼 제출 핸들러 */
    const handleSubmitForm = () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError('이메일을 입력해주세요.');
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            setError('올바른 이메일 형식을 입력해주세요.');
            return;
        }

        onSubmit(trimmedEmail);
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
                        className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] will-change-transform"
                    >
                        {/* 헤더 */}
                        <div className="flex items-center gap-3 px-7 pt-7 pb-1">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-linear-to-br from-violet-400 to-violet-600">
                                <HiOutlineEnvelope className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900">운영자 초대</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    <span className="font-semibold text-slate-500">{siteName}</span>에 운영자를 초대합니다
                                </p>
                            </div>
                            <button
                                onClick={onClose}
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
                                이메일 주소
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    if (error) setError('');
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="operator@example.com"
                                className={`w-full h-12 px-4 bg-slate-50 border rounded-xl text-sm font-medium text-slate-800 
                                    placeholder:text-slate-300 outline-none transition-all duration-150
                                    ${error
                                        ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                        : 'border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white'
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

                        {/* 안내 문구 */}
                        <div className="mx-7 mb-5 p-3 bg-violet-50 rounded-xl">
                            <p className="text-xs text-violet-600 font-medium leading-relaxed">
                                초대 이메일이 발송되며, 수락 시 해당 관광지의 관리자로 배정됩니다.
                            </p>
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
                                className="flex-1 h-11 rounded-xl font-semibold text-sm text-white bg-violet-500 
                                    hover:bg-violet-600 transition-colors duration-150"
                            >
                                초대 발송
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
