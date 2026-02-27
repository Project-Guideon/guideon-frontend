/**
 * 문서 업로드 유형 
 */
export type DocumentStatus = 'COMPLETED' | 'PROCESSING' | 'FAILED' | 'PENDING';

/**
 * 문서 업로드 엔티티
 *
 * 시스템 전반의 변경 사항과 작업 내역을 나타내는 도메인 모델
 */
export interface DocumentEntry {
    id: string;
    fileName: string;
    status: DocumentStatus;
    size: string;
    uploadedAt: string;
}
