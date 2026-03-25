import { apiClient } from '../client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api';
import type { Device, ZoneSource, CreateDeviceRequest, UpdateDeviceRequest, DeviceTokenResponse } from '@/features/device/domain/entities/Device';

/**
 * 백엔드 Device API 원본 응답 타입 (snake_case 혼재)
 */
interface RawDeviceResponse {
    deviceId?: string;
    device_id?: string;
    siteId?: number;
    site_id?: number;
    zoneId?: number | null;
    zone_id?: number | null;
    zoneSource?: string;
    zone_source?: string;
    locationName?: string;
    location_name?: string;
    latitude: number;
    longitude: number;
    isActive?: boolean;
    is_active?: boolean;
    lastPing?: string | null;
    last_ping?: string | null;
    lastAuthAt?: string | null;
    last_auth_at?: string | null;
    createdAt?: string;
    created_at?: string;
    updatedAt?: string;
    updated_at?: string;
}

/**
 * 백엔드 응답(snake_case/camelCase 혼재)을 프론트 Device 엔티티로 정규화
 */
function toDevice(raw: RawDeviceResponse): Device {
    return {
        deviceId: raw.deviceId ?? raw.device_id ?? '',
        siteId: raw.siteId ?? raw.site_id ?? 0,
        zoneId: raw.zoneId ?? raw.zone_id ?? null,
        zoneSource: (raw.zoneSource ?? raw.zone_source ?? 'AUTO') as ZoneSource,
        locationName: raw.locationName ?? raw.location_name ?? '',
        latitude: raw.latitude,
        longitude: raw.longitude,
        isActive: raw.isActive ?? raw.is_active ?? true,
        lastPing: raw.lastPing ?? raw.last_ping ?? null,
        lastAuthAt: raw.lastAuthAt ?? raw.last_auth_at ?? null,
        createdAt: raw.createdAt ?? raw.created_at ?? '',
        updatedAt: raw.updatedAt ?? raw.updated_at ?? '',
    };
}

/**
 * Device API 요청 시 snake_case 변환
 */
function toDeviceCreateBody(request: CreateDeviceRequest) {
    return {
        device_id: request.deviceId,
        location_name: request.locationName,
        latitude: request.latitude,
        longitude: request.longitude,
        zone_source: request.zoneSource,
        zone_id: request.zoneId,
        is_active: request.isActive,
    };
}

function toDeviceUpdateBody(request: UpdateDeviceRequest) {
    const body: Record<string, unknown> = {};
    if (request.locationName !== undefined) body.location_name = request.locationName;
    if (request.latitude !== undefined) body.latitude = request.latitude;
    if (request.longitude !== undefined) body.longitude = request.longitude;
    if (request.isActive !== undefined) body.is_active = request.isActive;
    if (request.zoneSource !== undefined) body.zone_source = request.zoneSource;
    if (request.zoneId !== undefined) body.zone_id = request.zoneId;
    return body;
}

/**
 * Device API Endpoints
 *
 * POST   /admin/sites/{siteId}/devices                              - 디바이스 등록
 * GET    /admin/sites/{siteId}/devices                              - 디바이스 목록
 * GET    /admin/sites/{siteId}/devices/{deviceId}                   - 디바이스 상세
 * PATCH  /admin/sites/{siteId}/devices/{deviceId}                   - 디바이스 수정
 * DELETE /admin/sites/{siteId}/devices/{deviceId}                   - 디바이스 삭제 (soft)
 * POST   /admin/sites/{siteId}/devices/{deviceId}/rotate-token      - 토큰 재발급
 */

/**
 * 디바이스 등록 (plainToken은 1회만 노출)
 */
export const createDeviceApi = async (siteId: number, request: CreateDeviceRequest) => {
    const response = await apiClient.post<ApiResponse<{ plainToken?: string; plain_token?: string; device: RawDeviceResponse }>>(
        `/admin/sites/${siteId}/devices`,
        toDeviceCreateBody(request),
    );
    const raw = response.data.data;
    return {
        ...response.data,
        data: {
            plainToken: raw.plainToken ?? raw.plain_token ?? '',
            device: toDevice(raw.device),
        } as DeviceTokenResponse,
    };
};

/**
 * 디바이스 목록 조회 (plainToken 미포함)
 */
export const getDevicesApi = async (
    siteId: number,
    params?: { page?: number; size?: number },
) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<RawDeviceResponse>>>(
        `/admin/sites/${siteId}/devices`,
        { params },
    );
    return {
        ...response.data,
        data: {
            ...response.data.data,
            items: response.data.data.items.map(toDevice),
        },
    };
};

/**
 * 디바이스 상세 조회
 */
export const getDeviceApi = async (siteId: number, deviceId: string) => {
    const response = await apiClient.get<ApiResponse<RawDeviceResponse>>(
        `/admin/sites/${siteId}/devices/${deviceId}`,
    );
    return {
        ...response.data,
        data: toDevice(response.data.data),
    };
};

/**
 * 디바이스 수정
 */
export const updateDeviceApi = async (siteId: number, deviceId: string, request: UpdateDeviceRequest) => {
    const response = await apiClient.patch<ApiResponse<RawDeviceResponse>>(
        `/admin/sites/${siteId}/devices/${deviceId}`,
        toDeviceUpdateBody(request),
    );
    return {
        ...response.data,
        data: toDevice(response.data.data),
    };
};

/**
 * 디바이스 삭제 (soft delete — isActive=false)
 */
export const deleteDeviceApi = async (siteId: number, deviceId: string) => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; deviceId?: string; device_id?: string }>>(
        `/admin/sites/${siteId}/devices/${deviceId}`,
    );
    const raw = response.data.data;
    return {
        ...response.data,
        data: {
            deleted: raw.deleted,
            deviceId: raw.deviceId ?? raw.device_id ?? deviceId,
        },
    };
};

/**
 * 디바이스 토큰 재발급 (기존 토큰 즉시 무효화, plainToken 1회만 노출)
 */
export const rotateDeviceTokenApi = async (siteId: number, deviceId: string) => {
    const response = await apiClient.post<ApiResponse<{ plainToken?: string; plain_token?: string; device: RawDeviceResponse }>>(
        `/admin/sites/${siteId}/devices/${deviceId}/rotate-token`,
    );
    const raw = response.data.data;
    return {
        ...response.data,
        data: {
            plainToken: raw.plainToken ?? raw.plain_token ?? '',
            device: toDevice(raw.device),
        } as DeviceTokenResponse,
    };
};
