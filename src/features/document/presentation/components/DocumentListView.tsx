'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    HiOutlineDocumentText,
    HiOutlineBuildingOffice2,
    HiOutlineChevronDown,
    HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import { DocumentTable } from './DocumentTable';
import { DocumentPagination } from './DocumentPagination';
import { DocumentFilter } from './DocumentFilter';
import { DocumentUploadPanel } from './DocumentUploadPanel';
import { useDocument } from '@/features/document/application/hooks/useDocument';
import { useSiteContext } from '@/features/auth/application/hooks/useAuth';

export function DocumentListView() {
    const {
        documents,
        page,
        setPage,
        totalPages,
        totalCount,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        uploadDocument,
        deleteDocument,
        reprocessDocument,
        isLoading,
        isMutating,
        error,
    } = useDocument();

    const { currentSiteId, currentSite, sites, setCurrentSite } = useSiteContext();

    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const handleFileUpload = async (files: File[]) => {
        for (const file of files) {
            try {
                await uploadDocument(file);
            } catch {
                // useDocument 내부에서 error 상태 관리
            }
        }
        setIsUploadOpen(false);
    };

    const handleDelete = async (docId: number) => {
        if (!confirm('이 문서를 삭제하시겠습니까?')) return;
        try {
            await deleteDocument(docId);
        } catch {
            // useDocument 내부에서 error 상태 관리
        }
    };

    const handleReprocess = async (docId: number) => {
        if (!confirm('이 문서를 재처리하시겠습니까?')) return;
        try {
            await reprocessDocument(docId);
        } catch {
            // useDocument 내부에서 error 상태 관리
        }
    };

    // 사이트 미선택 시
    if (currentSiteId === null) {
        return (
            <div className="flex flex-col gap-4">
                <DocumentPageHeader sites={sites} onSelectSite={setCurrentSite} />

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center text-center mt-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                        <HiOutlineExclamationTriangle className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">관광지를 선택해주세요</h3>
                    <p className="text-sm text-slate-400 max-w-sm mb-8">
                        문서를 관리하려면 먼저 관광지를 선택해야 합니다.
                    </p>

                    {sites.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-3">
                            {sites.map((site) => (
                                <button
                                    key={site.siteId}
                                    onClick={() => setCurrentSite(site.siteId)}
                                    className="group flex items-center gap-3 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100/50 transition-all duration-200 active:scale-[0.97]"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                        <HiOutlineBuildingOffice2 className="w-4.5 h-4.5 text-orange-400 group-hover:text-orange-600 transition-colors" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{site.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Site</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col w-full pb-10">
            {/* 헤더 */}
            <DocumentPageHeader
                siteName={currentSite?.name}
                sites={sites}
                onSelectSite={setCurrentSite}
            />

            {/* 에러 표시 */}
            {error && (
                <div className="mb-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                    <p className="text-sm font-bold text-red-600">{error.message}</p>
                </div>
            )}

            <DocumentFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                totalCount={totalCount}
                onUploadClick={() => setIsUploadOpen(true)}
            />

            {/* 문서 목록 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col transition-all overflow-hidden">
                <div className="flex-1 bg-white relative overflow-hidden scrollbar-hide">
                    {isLoading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                                <p className="text-xs font-bold text-slate-400">문서 목록을 불러오는 중...</p>
                            </div>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${page}-${statusFilter}-${searchQuery}`}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.15, ease: "easeInOut" }}
                                className="w-full h-full"
                            >
                                <DocumentTable
                                    documents={documents}
                                    onDelete={handleDelete}
                                    onReprocess={handleReprocess}
                                    isMutating={isMutating}
                                />
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
                <DocumentPagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>

            <AnimatePresence>
                {isUploadOpen && (
                    <DocumentUploadPanel
                        onClose={() => setIsUploadOpen(false)}
                        onUpload={handleFileUpload}
                        isUploading={isMutating}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * 문서 관리 페이지 헤더 (관광지 선택 드롭다운 포함)
 */
function DocumentPageHeader({
    siteName,
    sites,
    onSelectSite,
}: {
    siteName?: string;
    sites?: { siteId: number; name: string }[];
    onSelectSite?: (id: number) => void;
}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const hasSites = sites && sites.length > 1 && onSelectSite;

    return (
        <div className="flex items-start justify-between mb-3 -mt-2">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <HiOutlineDocumentText className="w-7 h-7 text-orange-500" />
                    문서 관리
                </h2>
                <p className="text-sm text-slate-500 mt-1.5 font-medium">
                    {siteName && <><span className="font-bold text-orange-600">{siteName}</span>의{' '}</>}
                    AI 학습을 위한 PDF 문서를 업로드하고 관리합니다.
                </p>
            </div>

            {hasSites && (
                <div className="relative z-20">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-orange-300 px-4 py-2.5 rounded-2xl text-slate-800 font-bold transition-all shadow-sm group"
                    >
                        <HiOutlineBuildingOffice2 className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-bold text-orange-600">{siteName ?? '관광지 선택'}</span>
                        <HiOutlineChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-all ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl py-2 z-50 shadow-xl overflow-hidden border border-slate-100"
                                >
                                    <div className="px-4 py-2 mb-1 border-b border-slate-100">
                                        <p className="text-xs font-bold text-slate-400">관광지 전환</p>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {sites.map((site) => (
                                            <button
                                                key={site.siteId}
                                                onClick={() => {
                                                    onSelectSite(site.siteId);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-all
                                                    ${siteName === site.name
                                                        ? 'bg-orange-50 text-orange-600'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                    }`}
                                            >
                                                {site.name}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
