/**
 * 관광지(Site) 도메인 엔티티
 *
 * API 명세서 기반 Site 관련 타입 정의
 * React에 의존하지 않는 순수 TypeScript 타입
 */

import type { InviteStatus } from '@/features/invite/domain/entities/InviteEntry';

/** 관광지 엔티티 */
export interface Site {
    siteId: number;
    name: string;
    isActive: boolean;
    /** 카카오맵 중심 위도 (-90 ~ 90). 미설정 시 null */
    latitude: number | null;
    /** 카카오맵 중심 경도 (-180 ~ 180). 미설정 시 null */
    longitude: number | null;
    /** 카카오맵 줌 레벨 (1 ~ 14, 작을수록 확대). 미설정 시 null */
    mapLevel: number | null;
    createdAt: string;
    updatedAt: string;
}

/** 관광지 생성 요청 */
export interface CreateSiteRequest {
    name: string;
    latitude?: number | null;
    longitude?: number | null;
    mapLevel?: number | null;
}

/**
 * 관광지 수정 요청
 *
 * ⚠️ 좌표 필드를 생략하면 서버에서 null로 덮어씁니다.
 * 이름만 수정하더라도 기존 좌표를 함께 전송해야 보존됩니다.
 */
export interface UpdateSiteRequest {
    name: string;
    latitude: number | null;
    longitude: number | null;
    mapLevel: number | null;
}

/** 관광지에 배정된 운영자 초대 정보 */
export interface SiteInvite {
    inviteId: number;
    siteId: number;
    email: string;
    status: InviteStatus;
    createdAt: string;
}

/** 관광지 + 배정된 초대 목록 조합 타입 */
export interface SiteWithInvites extends Site {
    invites: SiteInvite[];
}
