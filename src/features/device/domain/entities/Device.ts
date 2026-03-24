/**
 * Device 도메인 엔티티
 *
 * 키오스크 디바이스 관리에 사용되는 타입 정의
 * - API_SPEC.md 섹션 8 기반
 * - 자동/수동 Zone 할당, 토큰 관리 지원
 */

export type ZoneSource = 'AUTO' | 'MANUAL';

/**
 * Device 엔티티
 *
 * deviceId는 문자열 PK (예: "KIOSK-MAIN-01")
 * plainToken은 등록/토큰 재발급 시에만 1회 반환
 */
export interface Device {
    deviceId: string;
    siteId: number;
    zoneId: number | null;
    zoneSource: ZoneSource;
    locationName: string;
    latitude: number;
    longitude: number;
    isActive: boolean;
    lastPing: string | null;
    lastAuthAt: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * 디바이스 등록 요청
 */
export interface CreateDeviceRequest {
    deviceId: string;
    locationName: string;
    latitude: number;
    longitude: number;
    zoneSource?: ZoneSource;
    zoneId?: number;
    isActive?: boolean;
}

/**
 * 디바이스 수정 요청
 *
 * null인 필드는 무시. zoneSource 변경 시 zone 재할당 트리거.
 */
export interface UpdateDeviceRequest {
    locationName?: string;
    latitude?: number;
    longitude?: number;
    isActive?: boolean;
    zoneSource?: ZoneSource;
    zoneId?: number;
}

/**
 * 디바이스 등록/토큰 재발급 응답
 *
 * plainToken은 1회만 노출 — 즉시 저장 필요
 */
export interface DeviceTokenResponse {
    plainToken: string;
    device: Device;
}
