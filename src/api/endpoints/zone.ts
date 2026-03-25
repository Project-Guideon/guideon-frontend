import { apiClient } from '../client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api';
import type { Zone, CreateZoneRequest, UpdateZoneRequest, GeoJsonPolygon } from '@/features/zone/domain/entities/Zone';

/**
 * Zone 재계산 응답 타입
 */
export interface RecalcResponse {
    siteId: number;
    totalPlaces: number;
    updatedPlaces: number;
    totalDevices: number;
    updatedDevices: number;
}

/**
 * Zone 삭제 응답 타입
 */
export interface ZoneDeleteResponse {
    deleted: boolean;
    zoneId: number;
}

/**
 * Zone API 요청 시 snake_case 변환
 *
 * 요청 body가 snake_case를 사용
 * 응답은 camelCase
 */
function toZoneCreateBody(request: CreateZoneRequest) {
    return {
        name: request.name,
        code: request.code,
        zone_type: request.zoneType,
        parent_zone_id: request.parentZoneId,
        area_geojson: request.areaGeojson,
    };
}

function toZoneUpdateBody(request: UpdateZoneRequest) {
    const body: Record<string, unknown> = {};
    if (request.name !== undefined) body.name = request.name;
    if (request.code !== undefined) body.code = request.code;
    if (request.areaGeojson !== undefined) body.area_geojson = request.areaGeojson;
    return body;
}

/**
 * Zone API Endpoints
 *
 * GET    /admin/sites/{siteId}/zones              - 구역 목록
 * GET    /admin/sites/{siteId}/zones/{zoneId}     - 구역 상세
 * POST   /admin/sites/{siteId}/zones              - 구역 생성
 * PATCH  /admin/sites/{siteId}/zones/{zoneId}     - 구역 수정
 * DELETE /admin/sites/{siteId}/zones/{zoneId}     - 구역 삭제
 * POST   /admin/sites/{siteId}/zones/recalc       - 구역 재계산
 */

/**
 * 구역 목록 조회
 */
export const getZonesApi = async (
    siteId: number,
    params?: { zone_type?: string; parent_zone_id?: number; page?: number; size?: number },
) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Zone>>>(
        `/admin/sites/${siteId}/zones`,
        { params },
    );
    return response.data;
};

/**
 * 구역 상세 조회
 */
export const getZoneApi = async (siteId: number, zoneId: number) => {
    const response = await apiClient.get<ApiResponse<Zone>>(
        `/admin/sites/${siteId}/zones/${zoneId}`,
    );
    return response.data;
};

/**
 * 구역 생성
 */
export const createZoneApi = async (siteId: number, request: CreateZoneRequest) => {
    const response = await apiClient.post<ApiResponse<Zone>>(
        `/admin/sites/${siteId}/zones`,
        toZoneCreateBody(request),
    );
    return response.data;
};

/**
 * 구역 수정 (name, code, area_geojson만 변경 가능)
 */
export const updateZoneApi = async (siteId: number, zoneId: number, request: UpdateZoneRequest) => {
    const response = await apiClient.patch<ApiResponse<Zone>>(
        `/admin/sites/${siteId}/zones/${zoneId}`,
        toZoneUpdateBody(request),
    );
    return response.data;
};

/**
 * 구역 삭제 (INNER 삭제 시 하위 SUB cascade 삭제)
 */
export const deleteZoneApi = async (siteId: number, zoneId: number) => {
    const response = await apiClient.delete<ApiResponse<ZoneDeleteResponse>>(
        `/admin/sites/${siteId}/zones/${zoneId}`,
    );
    return response.data;
};

/**
 * 구역 재계산 (zoneSource=AUTO인 Place/Device의 zone 할당 재계산)
 */
export const recalcZonesApi = async (siteId: number) => {
    const response = await apiClient.post<ApiResponse<RecalcResponse>>(
        `/admin/sites/${siteId}/zones/recalc`,
    );
    return response.data;
};
