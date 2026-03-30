'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineTrash, HiOutlineDocumentText, HiOutlineArrowPath } from 'react-icons/hi2';
import { DocumentEntry } from '../../domain/entities/DocumentEntry';
import { DocumentStatusBadge } from './DocumentStatusBadge';

interface DocumentTableProps {
    documents: DocumentEntry[];
    onDelete: (docId: number) => void;
    onReprocess: (docId: number) => void;
    isMutating: boolean;
}

/**
 * 바이트 수를 사람이 읽기 쉬운 형식으로 변환
 */
function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, index)).toFixed(1)) + ' ' + units[index];
}

/**
 * ISO 날짜 문자열을 표시용 포맷으로 변환
 */
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export function DocumentTable({ documents, onDelete, onReprocess, isMutating }: DocumentTableProps) {
    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center min-h-[400px] justify-center py-20 text-slate-400">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <HiOutlineDocumentText className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-sm font-bold">등록된 문서가 없습니다</p>
                <p className="text-xs mt-1 text-slate-300">새로운 문서를 업로드해 보세요</p>
            </div>
        );
    }
    return (
        <div className="w-full h-[460px] overflow-y-hidden bg-white">
            <table className="w-full text-left border-separate border-spacing-0 bg-white min-w-[800px] table-fixed">
                <thead>
                    <tr className="bg-slate-50/30">
                        <th className="w-[35%] px-25 py-4 text-[13px] font-black text-slate-400 border-b border-slate-100">파일명</th>
                        <th className="w-[15%] px-4 py-4 text-[13px] font-black text-slate-400 text-center border-b border-slate-100">학습 상태</th>
                        <th className="w-[12%] px-4 py-4 text-[13px] font-black text-slate-400 text-center border-b border-slate-100">용량</th>
                        <th className="w-[20%] px-4 py-4 text-[13px] font-black text-slate-400 text-center border-b border-slate-100">업로드 일시</th>
                        <th className="w-[18%] px-8 py-4 text-[13px] font-black text-slate-400 text-right border-b border-slate-100">작업</th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    <AnimatePresence initial={false} mode="popLayout">
                        {documents.map((doc) => {
                            const isProcessing = doc.status === 'PROCESSING' || doc.status === 'PENDING';
                            const canReprocess = doc.status === 'COMPLETED' || doc.status === 'FAILED';

                            return (
                                <motion.tr key={doc.docId} layout initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0, transition: { duration: 0.15 } }}
                                    exit={{ opacity: 0, x: -100, transition: { duration: 0.1, ease: "easeInOut" } }}
                                    className="group hover:bg-slate-50/50 transition-colors">
                                    {/* 파일명 */}
                                    <td className="px-8 py-4 border-b border-slate-50 bg-white min-w-0">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="w-12 h-12 rounded-2xl border-red-100 border flex items-center justify-center text-red-500 shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0">
                                                <HiOutlineDocumentText className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col min-w-0 overflow-hidden">
                                                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 truncate">
                                                    {doc.originalName}
                                                </span>
                                                {doc.failedReason && (
                                                    <span className="text-[10px] font-bold text-red-400 truncate" title={doc.failedReason}>
                                                        {doc.failedReason}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* 상태 */}
                                    <td className="px-6 py-4 border-b border-slate-50 bg-white">
                                        <div className="flex justify-center">
                                            <DocumentStatusBadge status={doc.status} />
                                        </div>
                                    </td>

                                    {/* 파일 크기 */}
                                    <td className="px-6 py-4 text-center border-b border-slate-50 bg-white">
                                        <span className="text-xs text-slate-500 font-bold tabular-nums block">
                                            {formatFileSize(doc.fileSize)}
                                        </span>
                                    </td>

                                    {/* 업로드 일시 */}
                                    <td className="px-6 py-4 text-center border-b border-slate-50 bg-white">
                                        <span className="text-xs text-slate-500 font-medium tabular-nums block">
                                            {formatDate(doc.createdAt)}
                                        </span>
                                    </td>

                                    {/* 작업 */}
                                    <td className="px-8 py-4 border-b border-slate-50 bg-white">
                                        <div className="flex items-center justify-end gap-1 transition-opacity">
                                            {canReprocess && (
                                                <button
                                                    onClick={() => onReprocess(doc.docId)}
                                                    disabled={isMutating}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-30"
                                                    title="재처리"
                                                >
                                                    <HiOutlineArrowPath className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onDelete(doc.docId)}
                                                disabled={isMutating || isProcessing}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
                                                title={isProcessing ? '처리 중에는 삭제할 수 없습니다' : '삭제'}
                                            >
                                                <HiOutlineTrash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
}
