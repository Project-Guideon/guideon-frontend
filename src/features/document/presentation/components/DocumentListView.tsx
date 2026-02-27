'use client';

import { useState } from 'react';
import { HiOutlineDocumentText, HiOutlinePlus } from 'react-icons/hi2';
import { DocumentEntry } from '../../domain/entities/DocumentEntry';
import { DocumentTable } from './DocumentTable';

export function DocumentListView() {
    const [documents, setDocuments] = useState<DocumentEntry[]>([
        { id: '1', fileName: 'everland_guide_v1.pdf', status: 'COMPLETED', size: '2.4MB', uploadedAt: '2024-03-20' },
        { id: '2', fileName: 'safety_manual_jp.docx', status: 'PROCESSING', size: '1.1MB', uploadedAt: '2024-03-21' },
        { id: '3', fileName: 'zone_info_data.xlsx', status: 'FAILED', size: '450KB', uploadedAt: '2024-03-22' },
        { id: '4', fileName: 'new_kiosk_manual.pdf', status: 'PENDING', size: '5.2MB', uploadedAt: '2024-03-23' },
    ]);

    const handleDelete = (id: string) => {
        console.log(`Delete request for: ${id}`);
    };

    return (
        <div className="flex flex-col h-full">
            {/* 헤더 생략 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">문서 목록</h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        Total {documents.length}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <DocumentTable documents={documents} onDelete={handleDelete} />
                </div>
            </div>
        </div>
    );
}