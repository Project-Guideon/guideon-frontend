import { apiClient } from '../client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api';
import type { Device, CreateDeviceRequest, UpdateDeviceRequest, DeviceTokenResponse } from '@/features/device/domain/entities/Device';

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
    const response = await apiClient.post<ApiResponse<DeviceTokenResponse>>(
        `/admin/sites/${siteId}/devices`,
        request,
    );
    return response.data;
};

/**
 * 디바이스 목록 조회 (plainToken 미포함)
 */
export const getDevicesApi = async (
    siteId: number,
    params?: { page?: number; size?: number },
) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Device>>>(
        `/admin/sites/${siteId}/devices`,
        { params },
    );
    return response.data;
};

/**
 * 디바이스 상세 조회
 */
export const getDeviceApi = async (siteId: number, deviceId: string) => {
    const response = await apiClient.get<ApiResponse<Device>>(
        `/admin/sites/${siteId}/devices/${deviceId}`,
    );
    return response.data;
};

/**
 * 디바이스 수정
 */
export const updateDeviceApi = async (siteId: number, deviceId: string, request: UpdateDeviceRequest) => {
    const sanitized = Object.fromEntries(
        Object.entries(request).filter(([, value]) => value !== undefined),
    );
    const response = await apiClient.patch<ApiResponse<Device>>(
        `/admin/sites/${siteId}/devices/${deviceId}`,
        sanitized,
    );
    return response.data;
};

/**
 * 디바이스 삭제 (soft delete — isActive=false)
 */
export const deleteDeviceApi = async (siteId: number, deviceId: string) => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; deviceId: string }>>(
        `/admin/sites/${siteId}/devices/${deviceId}`,
    );
    return response.data;
};

/**
 * 디바이스 토큰 재발급 (기존 토큰 즉시 무효화, plainToken 1회만 노출)
 */
export const rotateDeviceTokenApi = async (siteId: number, deviceId: string) => {
    const response = await apiClient.post<ApiResponse<DeviceTokenResponse>>(
        `/admin/sites/${siteId}/devices/${deviceId}/rotate-token`,
    );
    return response.data;
};
