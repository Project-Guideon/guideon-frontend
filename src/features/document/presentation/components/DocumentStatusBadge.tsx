'use client';

import { DocumentStatus } from '@/features/document/domain/entities/DocumentEntry';

interface DocumentStatusBadgeProps {
    status: DocumentStatus;
}

/**
 * 문서 처리 상태 배지
 */
export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
    const statusStyles: Record<DocumentStatus, { label: string; style: string; dot: string; animate: boolean }> = {
        PENDING: { label: '대기 중', style: 'bg-amber-50 border-amber-100 text-amber-600', dot: 'bg-amber-400', animate: true },
        PROCESSING: { label: '분석 중', style: 'bg-blue-50 border-blue-100 text-blue-600', dot: 'bg-blue-500', animate: true },
        COMPLETED: { label: '학습 완료', style: 'bg-emerald-50 border-emerald-100 text-emerald-600', dot: 'bg-emerald-500', animate: false },
        FAILED: { label: '분석 실패', style: 'bg-red-50 border-red-100 text-red-600', dot: 'bg-red-500', animate: false },
    };
    const current = statusStyles[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${current.style}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${current.dot} ${current.animate ? 'animate-pulse' : ''}`} />
            {current.label}
        </span>
    );
}
