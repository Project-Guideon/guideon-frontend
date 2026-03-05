'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

interface ZoneDeleteDialogProps {
    isOpen: boolean;
    zoneName: string;
    hasSubZones: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

/**
 * 구역 삭제 확인 다이얼로그
 *
 * INNER 삭제 시 하위 SUB도 함께 삭제됨을 경고합니다.
 */
export function ZoneDeleteDialog({ isOpen, zoneName, hasSubZones, onClose, onConfirm }: ZoneDeleteDialogProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40"
                        onClick={onClose}
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
                            <h3 className="text-lg font-bold text-slate-800 mb-1">구역 삭제</h3>
                            <p className="text-sm text-slate-500 mb-1">
                                <span className="font-bold text-slate-700">{zoneName}</span>을(를) 삭제하시겠습니까?
                            </p>
                            {hasSubZones && (
                                <p className="text-xs text-red-500 font-bold bg-red-50 px-3 py-1.5 rounded-lg">
                                    ⚠️ 하위 구역(SUB)도 함께 삭제됩니다
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={() => { onConfirm(); onClose(); }}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
                            >
                                삭제
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
