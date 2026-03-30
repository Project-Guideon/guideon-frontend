import { apiClient } from '../client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api';

/**
 * Document 응답 타입 (snake_case — 백엔드 Document API 규칙)
 */
export interface DocumentResponse {
    doc_id: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    original_name: string;
    file_hash: string;
    file_size: number;
    chunk_size: number;
    chunk_overlap: number;
    embedding_model: string;
    failed_reason: string | null;
    processed_at: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Document 목록 조회 쿼리 파라미터
 */
export interface DocumentListParams {
    keyword?: string;
    status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    page?: number;
    size?: number;
}

/**
 * Document 재처리 요청 바디
 */
export interface ReprocessDocumentRequest {
    chunk_size?: number;
    chunk_overlap?: number;
    embedding_model?: string;
}

/**
 * Document API Endpoints
 *
 * POST   /admin/sites/{siteId}/documents/upload        - 문서 업로드 (multipart)
 * GET    /admin/sites/{siteId}/documents                - 문서 목록 조회
 * GET    /admin/sites/{siteId}/documents/{docId}        - 문서 상세 조회
 * POST   /admin/sites/{siteId}/documents/{docId}/reprocess - 문서 재처리
 * DELETE /admin/sites/{siteId}/documents/{docId}        - 문서 삭제
 */

/**
 * 문서 업로드 (multipart/form-data)
 */
export const uploadDocumentApi = async (siteId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<DocumentResponse>>(
        `/admin/sites/${siteId}/documents/upload`,
        formData,
        { timeout: 60000 },
    );
    return response.data;
};

/**
 * 문서 목록 조회
 */
export const getDocumentsApi = async (siteId: number, params?: DocumentListParams) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<DocumentResponse>>>(
        `/admin/sites/${siteId}/documents`,
        { params },
    );
    return response.data;
};

/**
 * 문서 상세 조회
 */
export const getDocumentApi = async (siteId: number, docId: number) => {
    const response = await apiClient.get<ApiResponse<DocumentResponse>>(
        `/admin/sites/${siteId}/documents/${docId}`,
    );
    return response.data;
};

/**
 * 문서 재처리
 */
export const reprocessDocumentApi = async (
    siteId: number,
    docId: number,
    request?: ReprocessDocumentRequest,
) => {
    const response = await apiClient.post<ApiResponse<DocumentResponse>>(
        `/admin/sites/${siteId}/documents/${docId}/reprocess`,
        request ?? {},
    );
    return response.data;
};

/**
 * 문서 삭제
 */
export const deleteDocumentApi = async (siteId: number, docId: number) => {
    const response = await apiClient.delete<ApiResponse<null>>(
        `/admin/sites/${siteId}/documents/${docId}`,
    );
    return response.data;
};
