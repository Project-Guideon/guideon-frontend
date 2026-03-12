'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo } from 'react';
import type { AdminRole } from '@/shared/types/auth';
import { loginApi, getMeApi, logoutApi } from '@/api/endpoints/auth';
import { tokenStorage } from '@/api/client';

/**
 * 인증된 사용자 정보
 */
export interface AuthUser {
    adminId: number;
    email: string;
    role: AdminRole;
    siteIds: number[];
}

/**
 * 사이트 정보
 */
export interface Site {
    siteId: number;
    name: string;
    isActive: boolean;
}

/**
 * Auth Context 상태
 */
interface AuthContextState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    currentSiteId: number | null;
    sites: Site[];
}

/**
 * Auth Context 액션
 */
interface AuthContextActions {
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    setCurrentSite: (siteId: number) => void;
}

type AuthContextType = AuthContextState & AuthContextActions;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * AuthProvider
 * 실제 백엔드 API 기반 인증 상태 관리
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentSiteId, setCurrentSiteId] = useState<number | null>(null);
    const [sites] = useState<Site[]>([]);

    /**
     * 저장된 토큰으로 사용자 정보 복원 (새로고침 대응)
     */
    const restoreSession = useCallback(async () => {
        const accessToken = tokenStorage.getAccessToken();
        if (!accessToken) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await getMeApi();
            const me = response.data;
            setUser({
                adminId: me.admin_id,
                email: me.email,
                role: me.role,
                siteIds: me.site_ids,
            });

            if (me.role === 'SITE_ADMIN' && me.site_ids.length > 0) {
                setCurrentSiteId(me.site_ids[0]);
            }
        } catch {
            tokenStorage.clearTokens();
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        restoreSession();
    }, [restoreSession]);

    /**
     * 로그인
     */
    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            const response = await loginApi({ email, password });
            const data = response.data;

            tokenStorage.setTokens(data.access_token, data.refresh_token);

            setUser({
                adminId: data.admin_id,
                email: data.email,
                role: data.role,
                siteIds: data.site_ids ?? [],
            });

            if (data.role === 'SITE_ADMIN' && data.site_ids && data.site_ids.length > 0) {
                setCurrentSiteId(data.site_ids[0]);
            }

            return true;
        } catch {
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * 로그아웃
     */
    const logout = useCallback(async () => {
        try {
            await logoutApi();
        } catch {
            // 로그아웃 API 실패해도 로컬 정리는 진행
        } finally {
            tokenStorage.clearTokens();
            setUser(null);
            setCurrentSiteId(null);
            window.location.href = '/login';
        }
    }, []);

    /**
     * 현재 사이트 변경
     */
    const setCurrentSite = useCallback((siteId: number) => {
        setCurrentSiteId(siteId);
    }, []);

    const value = useMemo<AuthContextType>(
        () => ({
            user,
            isAuthenticated: !!user,
            isLoading,
            currentSiteId,
            sites,
            login,
            logout,
            setCurrentSite,
        }),
        [user, isLoading, currentSiteId, sites, login, logout, setCurrentSite],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuthContext
 */
export function useAuthContext(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
