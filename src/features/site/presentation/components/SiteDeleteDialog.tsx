'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

/**
 * SiteDeleteDialogProps
 */
interface SiteDeleteDialogProps {
    isOpen: boolean;
    siteName: string;
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
 * 관광지 삭제 확인 다이얼로그
 */
export function SiteDeleteDialog({ isOpen, siteName, onClose, onConfirm }: SiteDeleteDialogProps) {
    const handleConfirmDelete = () => {
        onConfirm();
        onClose();
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

                    {/* 다이얼로그 본체 */}
                    <motion.div
                        variants={dialogVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full max-w-[380px] bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] will-change-transform"
                    >
                        <div className="px-7 pt-8 pb-7 text-center">
                            {/* 경고 아이콘 */}
                            <div className="mx-auto w-14 h-14 rounded-2xl bg-linear-to-br from-red-400 to-red-600 flex items-center justify-center mb-5 shadow-lg shadow-red-200">
                                <HiOutlineExclamationTriangle className="w-7 h-7 text-white" />
                            </div>

                            {/* 메시지 */}
                            <h3 className="text-lg font-bold text-slate-900 mb-2">관광지를 삭제할까요?</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                <span className="font-semibold text-slate-700">&quot;{siteName}&quot;</span>이(가)
                                영구적으로 삭제됩니다.
                            </p>
                            <p className="text-xs text-red-400 mt-1.5 font-medium">
                                이 작업은 되돌릴 수 없습니다.
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
                                    onClick={handleConfirmDelete}
                                    className="flex-1 h-11 rounded-xl font-semibold text-sm text-white bg-red-500 
                                        hover:bg-red-600 transition-colors duration-150"
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
