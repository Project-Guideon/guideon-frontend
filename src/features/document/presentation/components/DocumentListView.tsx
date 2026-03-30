'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlineDocumentText } from 'react-icons/hi2';
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

    const { currentSiteId } = useSiteContext();

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

    // 사이트 미선택 시 안내
    if (currentSiteId === null) {
        return (
            <div className="relative flex flex-col w-full pb-10">
                <div className="shrink-0 -mt-2">
                    <div className="flex items-center gap-2">
                        <h2 className="justify-between mb-3 text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <HiOutlineDocumentText className="w-7 h-7 text-orange-500" />
                            문서 관리
                        </h2>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                        <HiOutlineDocumentText className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">관광지를 먼저 선택해 주세요</p>
                    <p className="text-xs mt-1 text-slate-300">사이드바에서 관리할 관광지를 선택하면 문서 목록이 표시됩니다</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col w-full pb-10">
            {/* 헤더 */}
            <div className="shrink-0 -mt-2">
                <div className="flex items-center gap-2">
                    <h2 className="justify-between mb-3 text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <HiOutlineDocumentText className="w-7 h-7 text-orange-500" />
                        문서 관리
                    </h2>
                    <p className="justify-between mb-3 text-sm text-slate-500 mt-1 font-medium">
                        AI 학습을 위한 PDF 문서를 업로드하고 관리합니다.
                    </p>
                </div>
            </div>

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
