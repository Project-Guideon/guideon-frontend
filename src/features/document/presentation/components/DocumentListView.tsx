'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { HiOutlineDocumentText, HiOutlineDocumentPlus,HiChevronRight, HiChevronLeft, HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineMapPin, HiChevronDown, HiCheck } from 'react-icons/hi2';
import { DocumentTable } from './DocumentTable';
import { DocumentPagination } from './DocumentPagination';
import { DocumentFilter } from './DocumentFilter';
import { DocumentUploadPanel } from './DocumentUploadPanel';
import { useDocument } from '@/features/document/application/hooks/useDocument';
import { DocumentEntry } from '../../domain/entities/DocumentEntry';

export function DocumentListView() {
    const { documents, page, setPage, totalPages, totalCount, searchQuery, setSearchQuery, selectedSite, setSelectedSite,deleteDocument } = useDocument();

    useEffect(() => {
        setPage(0);
    }, [searchQuery, selectedSite, setPage]);

    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const filteredDocuments = useMemo(() => {
        return documents.filter((doc: DocumentEntry) => {
            const matchesSite = selectedSite === '전체 장소' || doc.site === selectedSite;
            const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSite && matchesSearch;
        });
    }, [documents, selectedSite, searchQuery]);

    const handleDelete = (id: string) => {
        console.log(`삭제 요청: ${id}`);
    };

    const handleDownload = (doc: DocumentEntry) => {
        console.log(`다운로드 시작: ${doc.fileName}`);
    };

    return (
        <div className="relative flex flex-col">
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
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex-1">
                    <DocumentTable 
                        documents={documents} 
                        onDelete={deleteDocument} 
                        onDownload={(doc) => console.log(doc.fileName)}
                    />
                </div>
                <DocumentPagination 
                    currentPage={page} 
                    totalPages={totalPages} 
                    onPageChange={setPage} 
                />
            </div>
            <AnimatePresence>
                {isUploadOpen && (
                    <DocumentUploadPanel onClose={() => setIsUploadOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}