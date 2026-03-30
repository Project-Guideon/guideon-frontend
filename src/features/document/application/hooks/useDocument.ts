'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { DocumentEntry, DocumentStatus } from '../../domain/entities/DocumentEntry';
import type { DocumentResponse } from '@/api/endpoints/document';
import { getDocumentsApi, uploadDocumentApi, deleteDocumentApi, reprocessDocumentApi } from '@/api/endpoints/document';
import { useSiteContext } from '@/features/auth/application/hooks/useAuth';
import type { ApiError } from '@/shared/types/api';
import { extractApiError } from '@/shared/utils/api';

/**
 * API 응답(snake_case) → 프론트엔드 엔티티(camelCase) 변환
 */
function toDocumentEntry(response: DocumentResponse): DocumentEntry {
    return {
        docId: response.doc_id,
        status: response.status,
        originalName: response.original_name,
        fileHash: response.file_hash,
        fileSize: response.file_size,
        chunkSize: response.chunk_size,
        chunkOverlap: response.chunk_overlap,
        embeddingModel: response.embedding_model,
        failedReason: response.failed_reason,
        processedAt: response.processed_at,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
    };
}

interface UseDocumentReturn {
    documents: DocumentEntry[];
    page: number;
    setPage: (page: number) => void;
    totalPages: number;
    totalCount: number;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: DocumentStatus | 'ALL';
    setStatusFilter: (status: DocumentStatus | 'ALL') => void;
    uploadDocument: (file: File) => Promise<void>;
    deleteDocument: (docId: number) => Promise<void>;
    reprocessDocument: (docId: number) => Promise<void>;
    refetchDocuments: () => Promise<void>;
    isLoading: boolean;
    isMutating: boolean;
    error: ApiError | null;
}

const PAGE_SIZE = 6;
const POLLING_INTERVAL = 5000;

/**
 * Document CRUD 훅 (API 연동)
 *
 * - 현재 선택된 siteId 기준으로 Document 목록을 가져옵니다.
 * - 서버사이드 페이지네이션, 키워드 검색, 상태 필터링
 * - 업로드/삭제/재처리 후 자동으로 목록을 갱신합니다.
 */
export function useDocument(): UseDocumentReturn {
    const [documents, setDocuments] = useState<DocumentEntry[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'ALL'>('ALL');
    const [isLoading, setIsLoading] = useState(false);
    const [isMutating, setIsMutating] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const { currentSiteId } = useSiteContext();
    const pollingInFlightRef = useRef(false);

    /** siteId 변경 시 페이지/필터 초기화 */
    const prevSiteIdRef = useRef(currentSiteId);
    useEffect(() => {
        if (prevSiteIdRef.current !== currentSiteId) {
            prevSiteIdRef.current = currentSiteId;
            setPage(0);
            setSearchQuery('');
            setStatusFilter('ALL');
            setError(null);
        }
    }, [currentSiteId]);

    /**
     * 문서 목록 조회
     * @param requestedPage 특정 페이지 요청 (업로드 후 0페이지로 이동 등)
     * @param silent true면 로딩 스피너 표시 안 함 (폴링용)
     */
    const fetchDocuments = useCallback(async (requestedPage?: number, silent?: boolean) => {
        if (currentSiteId === null) {
            setDocuments([]);
            setTotalPages(1);
            setTotalCount(0);
            return;
        }

        if (silent && pollingInFlightRef.current) return;

        if (!silent) {
            setIsLoading(true);
            setError(null);
        }

        if (silent) {
            pollingInFlightRef.current = true;
        }

        try {
            const response = await getDocumentsApi(currentSiteId, {
                page: requestedPage ?? page,
                size: PAGE_SIZE,
                keyword: searchQuery || undefined,
                status: statusFilter !== 'ALL' ? statusFilter : undefined,
            });

            if (response.success) {
                setDocuments(response.data.items.map(toDocumentEntry));
                setTotalPages(response.data.page.total_pages || 1);
                setTotalCount(response.data.page.total_elements);
            } else {
                setDocuments([]);
                setError({
                    code: response.error?.code ?? 'INTERNAL_ERROR',
                    message: response.error?.message ?? '문서 목록 조회에 실패했습니다.',
                });
            }
        } catch (err) {
            const apiError = extractApiError(err);
            if (!silent) {
                setError(apiError);
            }
        } finally {
            if (!silent) {
                setIsLoading(false);
            }
            if (silent) {
                pollingInFlightRef.current = false;
            }
        }
    }, [currentSiteId, page, searchQuery, statusFilter]);

    /** siteId, 페이지, 필터 변경 시 자동 조회 */
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    /**
     * PENDING/PROCESSING 문서가 있으면 5초마다 자동 갱신
     * 상태 변화 감지 후 자동 중단
     */
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const hasProcessing = documents.some(
            (doc) => doc.status === 'PENDING' || doc.status === 'PROCESSING',
        );

        if (hasProcessing && currentSiteId !== null) {
            pollingRef.current = setInterval(() => {
                fetchDocuments(undefined, true);
            }, POLLING_INTERVAL);
        }

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [documents, currentSiteId, fetchDocuments]);

    /** 검색어/필터 변경 시 첫 페이지로 리셋 */
    const handleSearchQuery = useCallback((query: string) => {
        setSearchQuery(query);
        setPage(0);
    }, []);

    const handleStatusFilter = useCallback((status: DocumentStatus | 'ALL') => {
        setStatusFilter(status);
        setPage(0);
    }, []);

    /** 문서 업로드 */
    const uploadDocument = useCallback(async (file: File) => {
        if (currentSiteId === null) {
            throw new Error('현재 사이트가 선택되지 않았습니다.');
        }

        setIsMutating(true);
        setError(null);

        try {
            const response = await uploadDocumentApi(currentSiteId, file);
            if (!response.success) {
                const apiError: ApiError = {
                    code: response.error?.code ?? 'INTERNAL_ERROR',
                    message: response.error?.message ?? '문서 업로드에 실패했습니다.',
                };
                setError(apiError);
                throw new Error(apiError.message);
            }
            setPage(0);
            await fetchDocuments(0);
        } catch (err) {
            if (!error) {
                const apiError = extractApiError(err);
                setError(apiError);
            }
            throw err;
        } finally {
            setIsMutating(false);
        }
    }, [currentSiteId, fetchDocuments, error]);

    /** 문서 삭제 */
    const deleteDocument = useCallback(async (docId: number) => {
        if (currentSiteId === null) return;

        setIsMutating(true);
        setError(null);

        try {
            const response = await deleteDocumentApi(currentSiteId, docId);
            if (!response.success) {
                const apiError: ApiError = {
                    code: response.error?.code ?? 'INTERNAL_ERROR',
                    message: response.error?.message ?? '문서 삭제에 실패했습니다.',
                };
                setError(apiError);
                throw new Error(apiError.message);
            }
            await fetchDocuments();
        } catch (err) {
            if (!error) {
                const apiError = extractApiError(err);
                setError(apiError);
            }
            throw err;
        } finally {
            setIsMutating(false);
        }
    }, [currentSiteId, fetchDocuments, error]);

    /** 문서 재처리 */
    const reprocessDocument = useCallback(async (docId: number) => {
        if (currentSiteId === null) return;

        setIsMutating(true);
        setError(null);

        try {
            const response = await reprocessDocumentApi(currentSiteId, docId);
            if (!response.success) {
                const apiError: ApiError = {
                    code: response.error?.code ?? 'INTERNAL_ERROR',
                    message: response.error?.message ?? '문서 재처리에 실패했습니다.',
                };
                setError(apiError);
                throw new Error(apiError.message);
            }
            await fetchDocuments();
        } catch (err) {
            if (!error) {
                const apiError = extractApiError(err);
                setError(apiError);
            }
            throw err;
        } finally {
            setIsMutating(false);
        }
    }, [currentSiteId, fetchDocuments, error]);

    return {
        documents,
        page,
        setPage,
        totalPages,
        totalCount,
        searchQuery,
        setSearchQuery: handleSearchQuery,
        statusFilter,
        setStatusFilter: handleStatusFilter,
        uploadDocument,
        deleteDocument,
        reprocessDocument,
        refetchDocuments: fetchDocuments,
        isLoading,
        isMutating,
        error,
    };
}
