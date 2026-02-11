/**
 * 감사 로그 유형 (시스템, 사용자, 디바이스)
 */
export type AuditLogType = 'SYSTEM' | 'USER' | 'DEVICE';

/**
 * 감사 로그 상태 (성공, 경고, 오류)
 */
export type AuditLogStatus = 'success' | 'warning' | 'error';

/**
 * 감사 로그 엔티티
 *
 * 시스템 전반의 변경 사항과 작업 내역을 나타내는 도메인 모델
 */
export interface AuditLogEntry {
    id: number;
    type: AuditLogType;
    site?: string;
    action: string;
    target: string;
    time: string;
    status: AuditLogStatus;
    message: string;
}
