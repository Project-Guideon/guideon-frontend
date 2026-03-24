'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineExclamationTriangle,
    HiOutlineClipboardDocument,
    HiOutlineCheckCircle,
    HiOutlineKey,
    HiOutlineXMark,
} from 'react-icons/hi2';

interface DeviceTokenDialogProps {
    isOpen: boolean;
    deviceId: string;
    /** null이면 재발급 확인 단계, 값이 있으면 토큰 표시 단계 */
    newToken: string | null;
    onClose: () => void;
    onConfirmRotate: () => void;
}

/**
 * 디바이스 토큰 재발급 다이얼로그
 *
 * 1단계: 재발급 확인 (경고)
 * 2단계: 새 토큰 표시 + 복사
 */
export function DeviceTokenDialog({ isOpen, deviceId, newToken, onClose, onConfirmRotate }: DeviceTokenDialogProps) {
    const [isTokenCopied, setIsTokenCopied] = useState(false);

    const handleCopyToken = async () => {
        if (!newToken) return;
        try {
            await navigator.clipboard.writeText(newToken);
            setIsTokenCopied(true);
            setTimeout(() => setIsTokenCopied(false), 2000);
        } catch {
            /* clipboard API 실패 시 무시 */
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full max-w-md text-left bg-white rounded-2xl shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <HiOutlineKey className="w-5 h-5 text-violet-500" />
                                    토큰 재발급
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                    aria-label="닫기"
                                >
                                    <HiOutlineXMark className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {!newToken ? (
                                    /* 1단계: 재발급 확인 */
                                    <>
                                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                                            <HiOutlineExclamationTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-red-700 mb-0.5">기존 토큰이 즉시 무효화됩니다</p>
                                                <p className="text-[11px] text-red-600">
                                                    <strong>{deviceId}</strong>의 토큰을 재발급하면 기존 토큰으로는 더 이상 인증할 수 없습니다.
                                                    키오스크 설정을 업데이트해야 합니다.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                                            >
                                                취소
                                            </button>
                                            <button
                                                type="button"
                                                onClick={onConfirmRotate}
                                                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
                                            >
                                                재발급
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    /* 2단계: 새 토큰 표시 */
                                    <>
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
                                            <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-amber-700 mb-0.5">이 토큰은 지금만 확인할 수 있습니다</p>
                                                <p className="text-[11px] text-amber-600">
                                                    창을 닫으면 다시 볼 수 없습니다. 반드시 복사하여 안전한 곳에 저장하세요.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                            <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">New Device Token</p>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 text-sm font-mono text-slate-800 break-all select-all">
                                                    {newToken}
                                                </code>
                                                <button
                                                    type="button"
                                                    onClick={handleCopyToken}
                                                    className={`shrink-0 p-2 rounded-lg transition-all ${
                                                        isTokenCopied
                                                            ? 'bg-green-100 text-green-600'
                                                            : 'bg-white border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                                                    }`}
                                                    aria-label="토큰 복사"
                                                >
                                                    {isTokenCopied ? (
                                                        <HiOutlineCheckCircle className="w-4 h-4" />
                                                    ) : (
                                                        <HiOutlineClipboardDocument className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="w-full py-2.5 rounded-xl bg-violet-500 text-white text-sm font-bold hover:bg-violet-600 shadow-lg shadow-violet-200 transition-all active:scale-[0.98]"
                                        >
                                            확인
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
