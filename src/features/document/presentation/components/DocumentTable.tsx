'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineTrash, HiOutlineDocumentText, HiOutlineArrowDownTray, HiOutlineDocumentArrowUp, HiOutlineTableCells, HiOutlineDocumentMinus, HiOutlineDocument } from 'react-icons/hi2';
import { DocumentEntry } from '../../domain/entities/DocumentEntry';
import { DocumentStatusBadge } from './DocumentStatusBadge';

interface DocumentTableProps {
    documents: DocumentEntry[];
    onDelete: (id: string) => void;
    onDownload?: (doc: DocumentEntry) => void;
}

const EXTENSION_THEMES = {
    pdf: {
        icon: HiOutlineDocumentText,
        color: 'text-red-500',
        border: 'border-red-100',
        label: 'PDF Document'
    },
    docx: {
        icon: HiOutlineDocument,
        color: 'text-blue-500',
        border: 'border-blue-100',
        label: 'Word Document'
    },
    xlsx: {
        icon: HiOutlineTableCells,
        color: 'text-emerald-500',
        border: 'border-emerald-100',
        label: 'Excel Sheet'
    },
    txt: {
        icon: HiOutlineDocument,
        color: 'text-slate-500',
        border: 'border-slate-100',
        label: 'Text File'
    },
}

export function DocumentTable({ documents, onDelete, onDownload }: DocumentTableProps) {
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
        <div className="w-full overflow-y-hidden bg-white scrollbar-hide">
            <table className="w-full text-left border-separate border-spacing-0 bg-white min-w-[800px] table-fixed">
                <thead>
                    <tr className="bg-slate-50/30">
                        <th className="w-[40%] px-25 py-4 text-[13px] font-black text-slate-400 border-b border-slate-100">파일명</th>
                        <th className="w-[15%] px-4 py-4 text-[13px] font-black text-slate-400 text-center border-b border-slate-100">학습 상태</th>
                        <th className="w-[13%] px-4 py-4 text-[13px] font-black text-slate-400 text-center border-b border-slate-100">용량</th>
                        <th className="w-[18%] px-4 py-4 text-[13px] font-black text-slate-400 text-center border-b border-slate-100">업로드 일시</th>
                        <th className="w-[12%] px-16 py-4 text-[13px] font-black text-slate-400 text-right border-b border-slate-100">작업</th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {documents.map((doc) => {
                            const theme = EXTENSION_THEMES[doc.extension] || EXTENSION_THEMES.txt;
                            const Icon = theme.icon;
                            return (
                                <motion.tr key={doc.id} layout initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 1 }} 
                                        exit={{ opacity: 0, scale: 0.98,
                                        transition: { duration: 0.2 }}}
                                        className="group hover:bg-slate-50/50 transition-colors">
                                    {/* 파일명, 아이콘 */}
                                    <td className="px-8 py-4 border-b border-slate-50 bg-white">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl ${theme.border} border flex items-center justify-center ${theme.color} shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 truncate">
                                                    {doc.fileName}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                    {doc.site}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* 상태 */}
                                    <td className="px-6 py-4 border-b border-slate-50 bg-white">
                                        <div className="flex justify-center">
                                            <DocumentStatusBadge status={doc.status} />
                                        </div>
                                    </td>

                                    {/*파일 크기 */}
                                    <td className="px-6 py-4 text-center border-b border-slate-50 bg-white">
                                        <span className="text-xs text-slate-500 font-bold tabular-nums">
                                            {doc.size}
                                        </span>
                                    </td>

                                    {/* 업로드 일시 */}
                                    <td className="px-6 py-4 text-center border-b border-slate-50 bg-white">
                                        <span className="text-xs text-slate-500 font-medium tabular-nums">
                                            {doc.uploadedAt}
                                        </span>
                                    </td>

                                    {/* 작업 */}
                                    <td className="px-8 py-4 border-b border-slate-50 bg-white">
                                        <div className="flex items-center justify-end gap-1 opacity-0 opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => onDownload?.(doc)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="다운로드"
                                            >
                                                <HiOutlineArrowDownTray className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => onDelete(doc.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="삭제"
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