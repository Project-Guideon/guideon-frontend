'use client';

import { useRef, useEffect, useState } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineDocumentPlus, HiOutlineFunnel, HiChevronDown, HiCheck } from 'react-icons/hi2';
import type { DocumentStatus } from '@/features/document/domain/entities/DocumentEntry';

interface DocumentFilterProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    statusFilter: DocumentStatus | 'ALL';
    setStatusFilter: (status: DocumentStatus | 'ALL') => void;
    totalCount: number;
    onUploadClick: () => void;
}

const STATUS_OPTIONS: { value: DocumentStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: '전체 상태' },
    { value: 'PENDING', label: '대기 중' },
    { value: 'PROCESSING', label: '분석 중' },
    { value: 'COMPLETED', label: '학습 완료' },
    { value: 'FAILED', label: '분석 실패' },
];

export function DocumentFilter({ searchQuery, setSearchQuery, statusFilter, setStatusFilter, totalCount, onUploadClick }: DocumentFilterProps) {
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const statusRef = useRef<HTMLDivElement>(null);

    const currentStatusLabel = STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label ?? '전체 상태';

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
                setIsStatusOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* 검색 영역 */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm font-bold text-slate-500 whitespace-nowrap">검색</span>
                    <div className="relative group flex-1 max-w-sm">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center text-slate-500 group-hover:text-orange-600 transition-colors pointer-events-none">
                            <HiOutlineMagnifyingGlass className="w-3.5 h-3.5" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="파일명으로 검색"
                            className="w-full h-[36px] pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {/* 상태 필터 */}
                    <div className="hidden sm:block w-[1px] h-8 bg-slate-200 mx-2" />
                    <span className="text-sm font-bold text-slate-500 whitespace-nowrap">상태</span>
                    <div className="relative" ref={statusRef}>
                        <button
                            onClick={() => setIsStatusOpen(!isStatusOpen)}
                            className={`flex items-center gap-2 px-3 py-1.5 bg-white border rounded-xl transition-all duration-200 outline-none h-[36px] min-w-[130px]
                                ${isStatusOpen
                                    ? 'border-orange-500 ring-4 ring-orange-50 text-slate-800'
                                    : 'border-slate-200 hover:border-orange-400 text-slate-600 hover:bg-orange-50'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${isStatusOpen ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                <HiOutlineFunnel className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold flex-1 text-left">
                                {currentStatusLabel}
                            </span>
                            <HiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isStatusOpen ? 'rotate-180 text-orange-500' : ''}`} />
                        </button>

                        {isStatusOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 p-1">
                                {STATUS_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setStatusFilter(option.value);
                                            setIsStatusOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${statusFilter === option.value ? 'bg-orange-50 text-orange-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {option.label}
                                        {statusFilter === option.value && <HiCheck className="w-3.5 h-3.5" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-2 px-5 h-[36px] rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-bold text-slate-500">
                        Total: <span className="text-orange-600">{totalCount}</span>
                    </span>
                </div>

                {/* 업로드 버튼 */}
                <button onClick={onUploadClick} className="flex items-center gap-2 px-5 h-[36px] bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-orange-600 transition-all shadow-md active:scale-95 group">
                    <HiOutlineDocumentPlus className="w-4 h-4 group-hover:rotate-15 transition-transform duration-300" />
                    <span>새 문서 업로드</span>
                </button>
            </div>
        </div>
    );
}
