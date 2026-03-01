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
 * SiteDeleteDialog — 관광지 삭제 확인 다이얼로그
 */
export function SiteDeleteDialog({ isOpen, siteName, onClose, onConfirm }: SiteDeleteDialogProps) {
    /** 삭제 확인 핸들러 */
    const handleConfirmDelete = () => {
        onConfirm();
        onClose();
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

                    {/* 다이얼로그 본체 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* 상단 장식 바 */}
                        <div className="h-2 w-full bg-red-500" />

                        <div className="p-8 text-center">
                            {/* 경고 아이콘 */}
                            <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
                                <HiOutlineExclamationTriangle className="w-7 h-7 text-red-500" />
                            </div>

                            {/* 메시지 */}
                            <h3 className="text-lg font-black text-slate-800 mb-2">관광지 삭제</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-8">
                                <span className="font-bold text-slate-700">&quot;{siteName}&quot;</span>을(를) 정말 삭제하시겠습니까?
                                <br />
                                <span className="text-xs text-red-400">이 작업은 되돌릴 수 없습니다.</span>
                            </p>

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
                                    onClick={handleConfirmDelete}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-red-500 
                                        hover:bg-red-600 shadow-lg shadow-red-200 
                                        transition-all duration-200 active:scale-[0.98]"
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
