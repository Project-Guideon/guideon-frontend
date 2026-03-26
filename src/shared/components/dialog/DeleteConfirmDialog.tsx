'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    title: string;
    targetName: string;
    warningMessage?: React.ReactNode;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
}

export function DeleteConfirmDialog({
    isOpen,
    title,
    targetName,
    warningMessage,
    onClose,
    onConfirm,
}: DeleteConfirmDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-dialog-title"
                    className="fixed inset-0 z-50 flex items-center justify-center"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40"
                        onClick={() => { if (!isDeleting) onClose(); }}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl p-6"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                                <HiOutlineExclamationTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 id="delete-dialog-title" className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
                            <p className="text-sm text-slate-500 mb-1">
                                <span className="font-bold text-slate-700">{targetName}</span>을(를) 삭제하시겠습니까?
                            </p>
                            {warningMessage && (
                                <div className="mt-2 text-xs text-red-500 font-bold bg-red-50 px-3 py-1.5 rounded-lg">
                                    {warningMessage}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all font-sans disabled:opacity-50"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isDeleting}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-[0.98] font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting && (
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                )}
                                {isDeleting ? '삭제 중...' : '삭제'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
