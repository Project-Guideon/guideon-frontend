'use client';

import { useState, useMemo } from 'react';
import type { DocumentEntry } from "../../domain/entities/DocumentEntry";

export function useDocument() {
    const [documents, setDocuments] = useState<DocumentEntry[]>([
        { id: '1', fileName: 'everland_guide_v1.pdf', extension: 'pdf', status: 'COMPLETED', size: '2.4MB', uploadedAt: '2024-03-20', site:'에버랜드' },
        { id: '2', fileName: 'safety_manual_jp.docx', extension: 'docx', status: 'PROCESSING', size: '1.1MB', uploadedAt: '2024-03-21', site:'에버랜드' },
        { id: '3', fileName: 'zone_info_data.xlsx', extension: 'xlsx', status: 'FAILED', size: '450KB', uploadedAt: '2024-03-22', site:'경복궁'},
        { id: '4', fileName: 'new_kiosk_manual.pdf', extension: 'pdf', status: 'PENDING', size: '5.2MB', uploadedAt: '2024-03-23' , site:'롯데월드'},
        { id: '5', fileName: 'everland_guide_v1.pdf', extension: 'pdf', status: 'COMPLETED', size: '2.4MB', uploadedAt: '2024-03-20', site:'에버랜드' },
        { id: '6', fileName: 'safety_manual_jp.docx', extension: 'docx', status: 'PROCESSING', size: '1.1MB', uploadedAt: '2024-03-21', site:'에버랜드' },
        { id: '7', fileName: 'zone_info_data.xlsx', extension: 'xlsx', status: 'FAILED', size: '450KB', uploadedAt: '2024-03-22', site:'경복궁'},
        { id: '8', fileName: 'new_kiosk_manual.pdf', extension: 'pdf', status: 'PENDING', size: '5.2MB', uploadedAt: '2024-03-23' , site:'롯데월드'},
        { id: '9', fileName: 'everland_guide_v1.pdf', extension: 'pdf', status: 'COMPLETED', size: '2.4MB', uploadedAt: '2024-03-20', site:'에버랜드' },
        { id: '10', fileName: 'safety_manual_jp.docx', extension: 'docx', status: 'PROCESSING', size: '1.1MB', uploadedAt: '2024-03-21', site:'에버랜드' },
        { id: '11', fileName: 'zone_info_data.xlsx', extension: 'xlsx', status: 'FAILED', size: '450KB', uploadedAt: '2024-03-22', site:'경복궁'},
        { id: '12', fileName: 'new_kiosk_manual.pdf', extension: 'pdf', status: 'PENDING', size: '5.2MB', uploadedAt: '2024-03-23' , site:'롯데월드'},
    ]);

    //페이지 상태
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSite, setSelectedSite] = useState('전체 장소');
    const itemsPerPage = 6;

    const filteredResults = useMemo(() => {
        return documents.filter(doc => {
            const matchesSite = selectedSite === '전체 장소' || doc.site === selectedSite;
            const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSite && matchesSearch;
        });
    }, [documents, searchQuery, selectedSite]);

    const paginatedDocuments = useMemo(() => {
        const startIndex = page * itemsPerPage;
        return filteredResults.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredResults, page]);

    const totalPages = Math.ceil(documents.length / itemsPerPage) || 1;
    const totalCount = documents.length;

    const deleteDocument = (id: string) => {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        console.log(`문서 삭제 완료: ${id}`);
    };

    return {
        documents: paginatedDocuments,
        page,
        setPage,
        totalPages,
        totalCount,
        searchQuery,
        setSearchQuery,
        selectedSite,
        setSelectedSite,
        deleteDocument
    };
}