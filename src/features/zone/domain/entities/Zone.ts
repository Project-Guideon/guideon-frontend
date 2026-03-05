/**
 * Zone 도메인 엔티티
 *
 * 구역 관리에 사용되는 타입 정의
 * - INNER: 최상위 구역 (level=1)
 * - SUB: INNER 하위 구역 (level=2)
 */

export type ZoneType = 'INNER' | 'SUB';

export interface GeoJsonPolygon {
    type: 'Polygon';
    coordinates: number[][][];
}

export interface Zone {
    zoneId: number;
    siteId: number;
    name: string;
    code: string;
    zoneType: ZoneType;
    level: number;
    parentZoneId: number | null;
    areaGeojson: GeoJsonPolygon;
    createdAt: string;
    updatedAt: string;
}

export interface CreateZoneRequest {
    name: string;
    code: string;
    zoneType: ZoneType;
    parentZoneId: number | null;
    areaGeojson: GeoJsonPolygon;
}

export interface UpdateZoneRequest {
    name?: string;
    code?: string;
    areaGeojson?: GeoJsonPolygon;
}
