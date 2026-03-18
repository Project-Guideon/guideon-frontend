'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlineDocumentText } from 'react-icons/hi2';
import { DocumentTable } from './DocumentTable';
import { DocumentPagination } from './DocumentPagination';
import { DocumentFilter } from './DocumentFilter';
import { DocumentUploadPanel } from './DocumentUploadPanel';
import { useDocument } from '@/features/document/application/hooks/useDocument';

export function DocumentListView() {
    const { documents, addDocument, page, setPage, totalPages, totalCount, searchQuery, setSearchQuery, selectedSite, setSelectedSite, deleteDocument } = useDocument();

    const ALLOWED_EXTENSIONS = ['pdf', 'xlsx'] as const;
    type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];
    const MAX_FILE_SIZE = 20 * 1024 * 1024;

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    useEffect(() => {
        setPage(0);
    }, [searchQuery, selectedSite, setPage]);

    const [isUploadOpen, setIsUploadOpen] = useState(false);


    const handleFileUpload = async (files: File[]) => {
        const validFiles: File[] = [];
        const errors: string[] = [];

        files.forEach((file) => {
            const rawExt = file.name.split('.').pop()?.toLowerCase() || '';
            const isAllowedExt = ALLOWED_EXTENSIONS.includes(rawExt as AllowedExtension);
            const isAllowedSize = file.size <= MAX_FILE_SIZE;

            if (!isAllowedExt) {
                errors.push(`[${file.name}]: 지원하지 않는 형식입니다.`);
            } else if (!isAllowedSize) {
                errors.push(`[${file.name}]: 용량이 너무 큽니다. (최대 20MB)`);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            alert(`일부 파일 업로드 실패:\n\n${errors.join('\n')}`);
        }

        // 검증 통과한 파일만
        if (validFiles.length > 0) {
            for (const file of validFiles) {
                const extension = file.name.split('.').pop()?.toLowerCase() as AllowedExtension;

                await addDocument({
                    fileName: file.name,
                    extension: extension,
                    size: formatFileSize(file.size),
                    site: selectedSite === '전체 장소' ? '장소 선택하여 다시 업로드해주세요.' : selectedSite
                });
            }
            setIsUploadOpen(false);
        }
    };

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
                        AI 학습을 위한 도메인 문서를 업로드하고 관리합니다.
                    </p>
                </div>
            </div>

            <DocumentFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedSite={selectedSite}
                setSelectedSite={setSelectedSite}
                totalCount={totalCount}
                onUploadClick={() => setIsUploadOpen(true)}
            />

            {/* 문서 목록 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col transition-all overflow-hidden">
                <div className="flex-1 bg-white relative overflow-hidden scrollbar-hide">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${page}-${selectedSite}-${searchQuery}`} // 페이지, 검색어, 장소 필터가 바뀔 때마다 부드럽게 전환
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15, ease: "easeInOut" }}
                            className="w-full h-full"
                        >
                            <DocumentTable
                                documents={documents}
                                onDelete={deleteDocument}
                                onDownload={(doc) => console.log(doc.fileName)}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
                <DocumentPagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>
            <AnimatePresence>
                {isUploadOpen && (
                    <DocumentUploadPanel onClose={() => setIsUploadOpen(false)} onUpload={handleFileUpload} />
                )}
            </AnimatePresence>
        </div>
    );
}