/**
 * 관광지(Site) 도메인 엔티티
 *
 * API 명세서 기반 Site 관련 타입 정의
 * React에 의존하지 않는 순수 TypeScript 타입
 */

/** 관광지 엔티티 */
export interface Site {
    siteId: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/** 관광지 생성 요청 */
export interface CreateSiteRequest {
    name: string;
}

/** 관광지 수정 요청 */
export interface UpdateSiteRequest {
    name: string;
}

/** 초대 상태 */
export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED';

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
