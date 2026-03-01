'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShieldCheck, HiOutlineShieldExclamation } from 'react-icons/hi2';

/**
 * SiteToggleDialogProps
 */
interface SiteToggleDialogProps {
    isOpen: boolean;
    siteName: string;
    currentlyActive: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

/**
 * 오버레이 & 모달 애니메이션
 */
const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const dialogVariants = {
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
 * SiteToggleDialog
 *
 * 상태 전환 전 사용자 확인
 */
export function SiteToggleDialog({ isOpen, siteName, currentlyActive, onClose, onConfirm }: SiteToggleDialogProps) {
    const handleConfirmToggle = () => {
        onConfirm();
        onClose();
    };

    /** ESC 키로 닫기 */
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    /** 비활성화 → 활성화 인지 여부 */
    const isActivating = !currentlyActive;

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

                    {/* 다이얼로그 본체 */}
                    <motion.div
                        variants={dialogVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="toggleDialogTitle"
                        className="relative w-full max-w-[380px] bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] will-change-transform"
                    >
                        <div className="px-7 pt-8 pb-7 text-center">
                            {/* 아이콘 */}
                            <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg
                                ${isActivating
                                    ? 'bg-linear-to-br from-emerald-400 to-emerald-600 shadow-emerald-200'
                                    : 'bg-linear-to-br from-amber-400 to-orange-500 shadow-orange-200'
                                }
                            `}>
                                {isActivating
                                    ? <HiOutlineShieldCheck className="w-7 h-7 text-white" />
                                    : <HiOutlineShieldExclamation className="w-7 h-7 text-white" />
                                }
                            </div>

                            {/* 메시지 */}
                            <h3 id="toggleDialogTitle" className="text-lg font-bold text-slate-900 mb-2">
                                관광지 {isActivating ? '활성화' : '비활성화'}
                            </h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                <span className="font-semibold text-slate-700">&quot;{siteName}&quot;</span>을(를)
                                {isActivating ? ' 활성화' : ' 비활성화'}합니다.
                            </p>
                            <p className={`text-xs mt-1.5 font-medium ${isActivating ? 'text-emerald-500' : 'text-orange-500'}`}>
                                {isActivating
                                    ? '활성화하면 해당 관광지의 서비스가 재개됩니다.'
                                    : '비활성화하면 해당 관광지의 모든 서비스가 중단됩니다.'
                                }
                            </p>

                            {/* 버튼 영역 */}
                            <div className="flex items-center gap-3 mt-7">
                                <button
                                    onClick={onClose}
                                    className="flex-1 h-11 rounded-xl font-semibold text-sm text-slate-500 bg-slate-100 
                                        hover:bg-slate-200 transition-colors duration-150"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleConfirmToggle}
                                    className={`flex-1 h-11 rounded-xl font-semibold text-sm text-white transition-colors duration-150
                                        ${isActivating
                                            ? 'bg-emerald-500 hover:bg-emerald-600'
                                            : 'bg-orange-500 hover:bg-orange-600'
                                        }
                                    `}
                                >
                                    {isActivating ? '활성화' : '비활성화'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
