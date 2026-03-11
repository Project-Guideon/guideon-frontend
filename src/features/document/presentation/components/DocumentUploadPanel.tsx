'use client';

import { motion } from 'framer-motion';
import { HiOutlineXMark, HiOutlineCloudArrowUp, HiOutlineDocumentPlus } from 'react-icons/hi2';

interface DocumentUploadPanelProps {
    onClose: () => void;
}

export function DocumentUploadPanel({ onClose }: DocumentUploadPanelProps) {
    return (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* 업로드 패널 */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* 헤더 */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                            <HiOutlineDocumentPlus className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 tracking-tight">새 문서 업로드</h3>
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Add New Document</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600 shadow-sm border border-transparent hover:border-slate-100 active:scale-90"
                    >
                        <HiOutlineXMark className="w-5 h-5" />
                    </button>
                </div>

                {/* 업로드 영역 */}
                <div className="px-10 pt-6 pb-10">
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl min-h-[420px] flex flex-col items-center justify-center bg-slate-50/30 hover:bg-orange-50/30 hover:border-orange-200 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-orange-500 group-hover:scale-110 transition-all duration-300 mb-4 mt-6">
                            <HiOutlineCloudArrowUp className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-black text-slate-700">클릭하거나 파일을 드래그하세요</p>
                        <p className="text-[10px] text-slate-400 mt-1 mb-4 font-bold uppercase tracking-tighter">PDF, DOCX, XLSX, TXT (Max 20MB)</p>
                    </div>
                </div>

                {/* 하단 액션 버튼 */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 h-12 rounded-2xl border border-slate-200 bg-white font-black text-xs text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
                    >
                        취소
                    </button>
                    <button className="flex-1 h-12 rounded-2xl bg-slate-900 font-black text-xs text-white hover:bg-orange-600 transition-all shadow-lg shadow-slate-200 active:scale-95">
                        업로드 시작
                    </button>
                </div>
            </motion.div>
        </div>
    );
}