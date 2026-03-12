'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { DocumentEntry } from "../../domain/entities/DocumentEntry";

export function useDocument() {
    const [documents, setDocuments] = useState<DocumentEntry[]>([
        { id: '1', fileName: 'everland_guide_v1.pdf', extension: 'pdf', status: 'COMPLETED', size: '2.4MB', uploadedAt: '2024-03-12', site: '에버랜드' },
        { id: '2', fileName: 'safety_manual_jp.docx', extension: 'docx', status: 'PROCESSING', size: '1.1MB', uploadedAt: '2024-03-13', site: '에버랜드' },
        { id: '3', fileName: 'zone_info_data.xlsx', extension: 'xlsx', status: 'FAILED', size: '450KB', uploadedAt: '2024-03-14', site: '경복궁' },
        { id: '4', fileName: 'new_kiosk_manual.pdf', extension: 'pdf', status: 'PENDING', size: '5.2MB', uploadedAt: '2024-03-15', site: '롯데월드' },
        { id: '5', fileName: 'staff_training_v1.docx', extension: 'docx', status: 'COMPLETED', size: '3.1MB', uploadedAt: '2024-03-16', site: '제주민속촌' },
        { id: '6', fileName: 'map_assets_ever.pdf', extension: 'pdf', status: 'COMPLETED', size: '12.4MB', uploadedAt: '2024-03-17', site: '에버랜드' },
        { id: '7', fileName: 'history_data.xlsx', extension: 'xlsx', status: 'FAILED', size: '1.2MB', uploadedAt: '2024-03-18', site: '경복궁' },
        { id: '8', fileName: 'kiosk_firmware.txt', extension: 'txt', status: 'PENDING', size: '45KB', uploadedAt: '2024-03-19', site: '롯데월드' },
        { id: '9', fileName: 'emergency_plan.pdf', extension: 'pdf', status: 'COMPLETED', size: '2.1MB', uploadedAt: '2024-03-20', site: '에버랜드' },
        { id: '10', fileName: 'site_survey_v2.docx', extension: 'docx', status: 'PROCESSING', size: '4.5MB', uploadedAt: '2024-03-21', site: '제주민속촌' },
        { id: '11', fileName: 'price_list_2024.xlsx', extension: 'xlsx', status: 'COMPLETED', size: '890KB', uploadedAt: '2024-03-22', site: '경복궁' },
        { id: '12', fileName: 'user_feedback.txt', extension: 'txt', status: 'COMPLETED', size: '12KB', uploadedAt: '2024-03-23', site: '롯데월드' },
        { id: '13', fileName: 'everland_summer.pdf', extension: 'pdf', status: 'COMPLETED', size: '5.6MB', uploadedAt: '2024-03-24', site: '에버랜드' },
        { id: '14', fileName: 'winter_guide_jp.pdf', extension: 'pdf', status: 'PENDING', size: '3.2MB', uploadedAt: '2024-03-25', site: '에버랜드' },
        { id: '15', fileName: 'palace_map.xlsx', extension: 'xlsx', status: 'FAILED', size: '2.1MB', uploadedAt: '2024-03-26', site: '경복궁' },
        { id: '16', fileName: 'world_event_list.docx', extension: 'docx', status: 'PROCESSING', size: '1.4MB', uploadedAt: '2024-03-27', site: '롯데월드' },
        { id: '17', fileName: 'folk_village_guide.pdf', extension: 'pdf', status: 'COMPLETED', size: '8.7MB', uploadedAt: '2024-03-28', site: '제주민속촌' },
        { id: '18', fileName: 'safety_check_mar.xlsx', extension: 'xlsx', status: 'COMPLETED', size: '420KB', uploadedAt: '2024-03-29', site: '에버랜드' },
        { id: '19', fileName: 'vendor_contact.txt', extension: 'txt', status: 'COMPLETED', size: '15KB', uploadedAt: '2024-03-30', site: '경복궁' },
        { id: '20', fileName: 'marketing_assets.pdf', extension: 'pdf', status: 'PENDING', size: '18.2MB', uploadedAt: '2024-03-31', site: '롯데월드' },
        { id: '21', fileName: 'translated_manual.docx', extension: 'docx', status: 'COMPLETED', size: '2.2MB', uploadedAt: '2024-04-01', site: '제주민속촌' },
        { id: '22', fileName: 'new_attraction_info.pdf', extension: 'pdf', status: 'PROCESSING', size: '4.8MB', uploadedAt: '2024-04-02', site: '에버랜드' },
        { id: '23', fileName: 'inventory_list.xlsx', extension: 'xlsx', status: 'FAILED', size: '3.1MB', uploadedAt: '2024-04-03', site: '경복궁' },
        { id: '24', fileName: 'kiosk_log_0404.txt', extension: 'txt', status: 'COMPLETED', size: '120KB', uploadedAt: '2024-04-04', site: '롯데월드' },
        { id: '25', fileName: 'final_report_v1.pdf', extension: 'pdf', status: 'COMPLETED', size: '1.2MB', uploadedAt: '2024-04-05', site: '제주민속촌' },
    ]);

    //페이지 상태
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSite, setSelectedSite] = useState('전체 장소');
    const itemsPerPage = 6;

    const filteredResults = useMemo(() => {
        const filtered = documents.filter(doc => {
            const matchesSite = selectedSite === '전체 장소' || doc.site === selectedSite;
            const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSite && matchesSearch;
        });
        return filtered.sort((a, b) =>  new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }, [documents, searchQuery, selectedSite]);

    const totalCount = filteredResults.length; 
    const totalPages = Math.ceil(totalCount / itemsPerPage) || 1; 
    
    useEffect(() => {
        if (page >= totalPages && totalPages > 0) {
            setPage(totalPages - 1);
        }
    }, [totalPages, page]);

    const addDocument = useCallback((newDoc: Omit<DocumentEntry, 'id' | 'uploadedAt' | 'status'>) => {
        const now = new Date();
        const doc: DocumentEntry = {
            ...newDoc, id: Math.random().toString(36).substr(2, 9),
            uploadedAt: now.toISOString().split('T')[0], 
            status: 'COMPLETED'
        };
        setDocuments(prev => [doc, ...prev]); 
        setPage(0);
    }, []);

    const paginatedDocuments = useMemo(() => {
        const startIndex = page * itemsPerPage;
        return filteredResults.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredResults, page]);

    const deleteDocument = useCallback((id: string) => {
        setDocuments(prev => {
            const newDocs = prev.filter(doc => doc.id !== id);
            const nextFilteredCount = newDocs.filter((doc: DocumentEntry) => {
                const matchesSite = selectedSite === '전체 장소' || doc.site === selectedSite;
                const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesSite && matchesSearch;
            }).length;
            const nextTotalPages = Math.ceil(nextFilteredCount / itemsPerPage) || 1;
             if (page >= nextTotalPages && page > 0) {
                setPage(nextTotalPages - 1);
            }
            return newDocs;
        });
    }, [page, selectedSite, searchQuery]);

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
        deleteDocument,
        addDocument
    };
}