'use client';

import { DocumentStatus } from '@/features/document/domain/entities/DocumentEntry';

interface DocumentStatusBadgeProps {
    status: DocumentStatus;
}

/**
 * 업로드 상태 배지 스타일
 */
export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
    const statusStyles: Record<DocumentStatus, string> = {
        COMPLETED: 'bg-green-50 border-green-100 text-green-600',
        PROCESSING: 'bg-amber-50 border-amber-100 text-amber-600',
        FAILED: 'bg-red-50 border-red-100 text-red-600',
        PENDING: 'bg-slate-50 border-slate-200 text-slate-500',
    };

    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${statusStyles[status]}`}>
            {status}
        </span>
    );
}