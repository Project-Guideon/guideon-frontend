'use client';

import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

interface AuditLogPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function AuditLogPagination({ currentPage, totalPages, onPageChange }: AuditLogPaginationProps) {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i);

    return (
        <div className="flex items-center justify-center gap-2 mt-3">
            {/* 이전 버튼 */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-200"
            >
                <HiChevronLeft className="w-5 h-5" />
            </button>

            {/* 페이지 번호 */}
            <div className="flex items-center gap-1.5">
                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200
                            ${currentPage === page
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-105'
                                : 'text-slate-500 hover:bg-orange-50 hover:text-orange-600'
                            }`}
                    >
                        {page + 1}
                    </button>
                ))}
            </div>

            {/* 다음 버튼 */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-200"
            >
                <HiChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}