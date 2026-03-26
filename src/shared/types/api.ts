/**
 * API 응답 공통 타입 (v4.0)
 */
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error: ApiError | null;
    trace_id: string;
}

export interface ApiError {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
}

/**
 * API 에러 코드 (v4.0)
 */
export type ErrorCode =
    | 'VALIDATION_ERROR'            // 400 입력값 검증 실패
    | 'AUTH_REQUIRED'               // 401 인증 필요
    | 'AUTH_INVALID'                // 401 인증 실패
    | 'ACCESS_DENIED'               // 403 접근 권한 없음
    | 'ADMIN_SITE_FORBIDDEN'        // 403 관리자 site 스코프 위반
    | 'SITE_INACTIVE'               // 403 site 비활성
    | 'DEVICE_INACTIVE'             // 403 비활성화된 디바이스
    | 'NOT_FOUND'                   // 404 리소스 없음
    | 'PLACE_NOT_FOUND'             // 404 장소 없음
    | 'ZONE_NOT_FOUND'              // 404 구역 없음
    | 'DEVICE_NOT_FOUND'            // 404 디바이스 없음
    | 'DOC_NOT_FOUND'               // 404 문서 없음
    | 'MASCOT_NOT_FOUND'            // 404 마스코트 없음
    | 'CONFLICT'                    // 409 유니크 충돌
    | 'ZONE_CODE_DUPLICATE'         // 409 구역 코드 중복
    | 'DOC_HASH_DUPLICATE'          // 409 동일 파일 업로드
    | 'MASCOT_ALREADY_EXISTS'       // 409 마스코트 중복 등록
    | 'DEVICE_ID_DUPLICATE'         // 409 디바이스 ID 중복
    | 'INVITE_EXPIRED'              // 410 초대 만료
    | 'INVITE_ALREADY_USED'         // 410 이미 사용된 초대
    | 'ZONE_SUB_OUTSIDE_PARENT'     // 422 SUB 폴리곤이 부모 밖
    | 'ZONE_SUB_OVERLAP_FORBIDDEN'  // 422 SUB 구역 겹침
    | 'DOMAIN_RULE_VIOLATION'       // 422 도메인 규칙 위반
    | 'RATE_LIMITED'                // 429 과다 요청
    | 'DOC_UPLOAD_FAILED'           // 500 파일 업로드 실패
    | 'INTERNAL_ERROR'              // 500 서버 오류
    | 'UPSTREAM_TIMEOUT';           // 503 외부 의존 장애

/**
 * 페이지네이션 응답 (v4.0)
 */
export interface PaginatedResponse<T> {
    items: T[];
    page: {
        number: number;        // 0-based
        size: number;
        total_elements: number;
        total_pages: number;
    };
}

