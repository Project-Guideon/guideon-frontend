'use client';

import { useAuthContext } from '../store/AuthContext';

/**
 * useAuth Hook
 * 인증 관련 상태 및 액션 제공
 */
export function useAuth() {
    const { user, isAuthenticated, isLoading, login, logout } = useAuthContext();

    return {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,

        // 편의 속성
        isPlatformAdmin: user?.role === 'PLATFORM_ADMIN',
        isSiteAdmin: user?.role === 'SITE_ADMIN',
    };
}

/**
 * useSiteContext Hook
 * 현재 선택된 사이트 관련 상태 제공
 */
export function useSiteContext() {
    const { currentSiteId, sites, setCurrentSite, user } = useAuthContext();

    return {
        currentSiteId,
        sites,
        setCurrentSite,

        // 현재 선택된 사이트 정보
        currentSite: sites.find((site) => site.siteId === currentSiteId) ?? null,

        // 사이트 접근 권한 확인
        canAccessSite: (siteId: number) => {
            if (!user) return false;
            if (user.role === 'PLATFORM_ADMIN') return true;
            return user.siteIds.includes(siteId);
        },
    };
}
