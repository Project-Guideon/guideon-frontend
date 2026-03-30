/**
 * 문서 처리 상태
 */
export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/**
 * 문서 엔티티 (API 응답 기반)
 *
 * 백엔드 Document API는 snake_case 응답이므로
 * 프론트엔드에서는 camelCase로 변환하여 사용
 */
export interface DocumentEntry {
    docId: number;
    status: DocumentStatus;
    originalName: string;
    fileHash: string;
    fileSize: number;
    chunkSize: number;
    chunkOverlap: number;
    embeddingModel: string;
    failedReason: string | null;
    processedAt: string | null;
    createdAt: string;
    updatedAt: string;
}
