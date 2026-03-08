'use client';

import { HiOutlineTrash, HiOutlineDocumentText, HiOutlineArrowDownTray, HiOutlineDocumentArrowUp } from 'react-icons/hi2';
import { DocumentEntry } from '../../domain/entities/DocumentEntry';
import { DocumentStatusBadge } from './DocumentStatusBadge';

interface DocumentTableProps {
    documents: DocumentEntry[];
    onDelete: (id: string) => void;
    onDownload?: (doc: DocumentEntry) => void;
}

export function DocumentTable({ documents, onDelete, onDownload }: DocumentTableProps) {
    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <HiOutlineDocumentText className="w-16 h-16 mb-4 text-slate-100" />
                <p className="text-sm font-bold">등록된 문서가 없습니다</p>
                <p className="text-xs mt-1 text-slate-300">새로운 문서를 업로드해 보세요</p>
            </div>
        );
    }
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">파일명</th>
                        <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">학습 상태</th>
                        <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">파일 크기</th>
                        <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">업로드 일시</th>
                        <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">작업</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {documents.map((doc) => (
                        <tr key={doc.id} className="group hover:bg-slate-50/50 transition-colors">
                            {/* 파일명, 아이콘 */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-orange-500 group-hover:shadow-sm transition-all border border-transparent group-hover:border-orange-100">
                                        <HiOutlineDocumentText className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 truncate">
                                            {doc.fileName}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                            {doc.extension} Document
                                        </span>
                                    </div>
                                </div>
                            </td>

                            {/* 상태 */}
                            <td className="px-6 py-4 text-center">
                                <DocumentStatusBadge status={doc.status} />
                            </td>

                            {/*파일 크기 */}
                            <td className="px-6 py-4">
                                <span className="text-xs text-slate-500 font-bold tabular-nums">
                                    {doc.size}
                                </span>
                            </td>

                            {/* 업로드 일시 */}
                            <td className="px-6 py-4">
                                <span className="text-xs text-slate-500 font-medium tabular-nums">
                                    {doc.uploadedAt}
                                </span>
                            </td>

                            <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}