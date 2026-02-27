'use client';

import { HiOutlineTrash } from 'react-icons/hi2';
import { DocumentEntry } from '../../domain/entities/DocumentEntry';
import { DocumentStatusBadge } from './DocumentStatusBadge';

interface DocumentTableProps {
    documents: DocumentEntry[];
    onDelete: (id: string) => void;
}

export function DocumentTable({ documents, onDelete }: DocumentTableProps) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">파일명</th>
                        <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">상태</th>
                        <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">크기</th>
                        <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">업로드일</th>
                        <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">작업</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {documents.map((doc) => (
                        <tr key={doc.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-4">
                                <span className="text-sm font-bold text-slate-700 group-hover:text-orange-600 transition-colors">
                                    {doc.fileName}
                                </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                                <DocumentStatusBadge status={doc.status} />
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-500 font-medium">
                                {doc.size}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-500 font-medium">
                                {doc.uploadedAt}
                            </td>
                            <td className="px-4 py-4 text-right">
                                <button 
                                    onClick={() => onDelete(doc.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="삭제"
                                >
                                    <HiOutlineTrash className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}