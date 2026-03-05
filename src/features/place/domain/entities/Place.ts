/**
 * Place 도메인 엔티티
 *
 * 장소(POI) 관리에 사용되는 타입 정의
 * - 카테고리별 분류, 다국어 이름, 자동/수동 Zone 할당 지원
 */

export type PlaceCategory =
    | 'TOILET'
    | 'TICKET'
    | 'RESTAURANT'
    | 'SHOP'
    | 'INFO'
    | 'ATTRACTION'
    | 'PARKING'
    | 'OTHER';

export type ZoneSource = 'AUTO' | 'MANUAL';

export interface Place {
    placeId: number;
    siteId: number;
    zoneId: number | null;
    zoneSource: ZoneSource;
    name: string;
    nameJson: Record<string, string> | null;
    category: PlaceCategory;
    latitude: number;
    longitude: number;
    description: string | null;
    imageUrl: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePlaceRequest {
    name: string;
    nameJson?: Record<string, string>;
    category: PlaceCategory;
    latitude: number;
    longitude: number;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
    zoneSource?: ZoneSource;
    zoneId?: number;
}

export interface UpdatePlaceRequest {
    name?: string;
    nameJson?: Record<string, string>;
    category?: PlaceCategory;
    latitude?: number;
    longitude?: number;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
    zoneSource?: ZoneSource;
    zoneId?: number;
}

/** 카테고리 표시용 메타데이터 */
export const PLACE_CATEGORY_META: Record<PlaceCategory, { label: string; emoji: string; color: string }> = {
    TOILET: { label: '화장실', emoji: '🚻', color: '#6366f1' },
    TICKET: { label: '매표소', emoji: '🎫', color: '#f59e0b' },
    RESTAURANT: { label: '식당', emoji: '🍽️', color: '#ef4444' },
    SHOP: { label: '매점·기념품', emoji: '🛍️', color: '#ec4899' },
    INFO: { label: '안내소', emoji: '📍', color: '#3b82f6' },
    ATTRACTION: { label: '관람·체험', emoji: '🎭', color: '#8b5cf6' },
    PARKING: { label: '주차장', emoji: '🅿️', color: '#64748b' },
    OTHER: { label: '기타', emoji: '📌', color: '#94a3b8' },
};
