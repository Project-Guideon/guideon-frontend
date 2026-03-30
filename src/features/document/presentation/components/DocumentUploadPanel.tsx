'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineXMark, HiOutlineDocumentText, HiOutlineCloudArrowUp, HiOutlineDocumentPlus } from 'react-icons/hi2';

interface DocumentUploadPanelProps {
    onClose: () => void;
    onUpload: (files: File[]) => void;
    isUploading: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function DocumentUploadPanel({ onClose, onUpload, isUploading }: DocumentUploadPanelProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const validateAndAddFiles = (files: File[]) => {
        const errors: string[] = [];
        const validFiles: File[] = [];

        files.forEach((file) => {
            const extension = file.name.split('.').pop()?.toLowerCase();
            if (extension !== 'pdf') {
                errors.push(`[${file.name}] PDF 파일만 업로드할 수 있습니다.`);
            } else if (file.size > MAX_FILE_SIZE) {
                errors.push(`[${file.name}] 파일 크기가 50MB를 초과합니다.`);
            } else {
                validFiles.push(file);
            }
        });

        setValidationErrors(errors);
        if (validFiles.length > 0) {
            setSelectedFiles((prev) => [...prev, ...validFiles]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndAddFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndAddFiles(Array.from(e.target.files));
        }
    };

    const handleUploadSubmit = () => {
        if (selectedFiles.length > 0 && !isUploading) {
            onUpload(selectedFiles);
        }
    };

    return (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

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
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">PDF Document Upload</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isUploading}
                        className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-600 shadow-sm border border-transparent hover:border-slate-100 active:scale-90 disabled:opacity-30"
                    >
                        <HiOutlineXMark className="w-5 h-5" />
                    </button>
                </div>

                {/* 업로드 영역 */}
                <div className="px-10 pt-6 pb-4">
                    <label
                        onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl min-h-[320px] flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden
                            ${isUploading ? 'pointer-events-none opacity-60' : ''}
                            ${dragActive ? "border-orange-500 bg-orange-50/50" : "border-slate-200 bg-slate-50/30 hover:bg-orange-50/30 hover:border-orange-200"}`}
                    >
                        <input type="file" multiple accept=".pdf" className="hidden" onChange={handleChange} disabled={isUploading} />

                        {selectedFiles.length === 0 ? (
                            <>
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 mb-4 mt-6">
                                    <HiOutlineCloudArrowUp className="w-8 h-8" />
                                </div>
                                <p className="text-sm font-black text-slate-700">클릭하거나 파일을 드래그하세요</p>
                                <p className="text-[10px] text-slate-400 mt-1 mb-4 font-bold uppercase tracking-tighter">PDF Only (Max 50MB)</p>
                            </>
                        ) : (
                            <div className="w-full px-4 space-y-2 mt-2 max-h-[250px] overflow-y-auto">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                                        <HiOutlineDocumentText className="w-5 h-5 text-red-500 shrink-0" />
                                        <span className="text-xs font-bold text-slate-700 truncate flex-1">{file.name}</span>
                                        <span className="text-[10px] text-slate-400 font-bold shrink-0">
                                            {(file.size / 1024 / 1024).toFixed(1)}MB
                                        </span>
                                        <button onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
                                        }} className="text-slate-400 hover:text-red-500" disabled={isUploading}>
                                            <HiOutlineXMark className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <p className="text-center text-[10px] font-bold text-orange-500 mb-3 mt-3">+ 파일을 더 추가하려면 드래그하세요</p>
                            </div>
                        )}
                    </label>

                    {/* 검증 에러 */}
                    {validationErrors.length > 0 && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                            {validationErrors.map((error, index) => (
                                <p key={index} className="text-[11px] text-red-600 font-bold">{error}</p>
                            ))}
                        </div>
                    )}
                </div>

                {/* 하단 액션 버튼 */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                    <button onClick={onClose} disabled={isUploading} className="flex-1 h-12 rounded-2xl border border-slate-200 bg-white font-black text-xs text-slate-500 hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-30">
                        취소
                    </button>
                    <button
                        onClick={handleUploadSubmit}
                        disabled={selectedFiles.length === 0 || isUploading}
                        className="flex-1 h-12 rounded-2xl bg-slate-900 font-black text-xs text-white hover:bg-orange-600 transition-all shadow-lg shadow-slate-200 active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
                    >
                        {isUploading ? '업로드 중...' : `업로드 시작 (${selectedFiles.length})`}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
