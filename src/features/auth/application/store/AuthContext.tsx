'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import type { AdminRole } from '@/shared/types/auth';

/**
 * Mock 사용자 정보
 */
export interface AuthUser {
    adminId: number;
    email: string;
    role: AdminRole;
    siteIds: number[];
}

/**
 * Mock 사이트 정보
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
    logout: () => void;
    setCurrentSite: (siteId: number) => void;
}

type AuthContextType = AuthContextState & AuthContextActions;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Mock 데이터
 */
const MOCK_PLATFORM_ADMIN: AuthUser = {
    adminId: 1,
    email: 'admin@guideon.com',
    role: 'PLATFORM_ADMIN',
    siteIds: [],
};

const MOCK_SITE_ADMIN: AuthUser = {
    adminId: 2,
    email: 'operator@example.com',
    role: 'SITE_ADMIN',
    siteIds: [1],
};

const MOCK_SITES: Site[] = [
    { siteId: 1, name: '에버랜드', isActive: true },
    { siteId: 2, name: '롯데월드', isActive: true },
    { siteId: 3, name: '서울랜드', isActive: false },
];

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * AuthProvider
 * Mock 데이터 기반 인증 상태 관리
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(MOCK_PLATFORM_ADMIN); // 기본: 로그인 상태
    const [isLoading, setIsLoading] = useState(false);
    const [currentSiteId, setCurrentSiteId] = useState<number | null>(1);

    /**
     * Mock 로그인
     */
    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);

        // Mock: 간단한 지연
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock 로그인 로직
        if (email === 'admin@guideon.com' && password === 'admin1234') {
            setUser(MOCK_PLATFORM_ADMIN);
            setCurrentSiteId(1);
            setIsLoading(false);
            return true;
        } else if (email === 'operator@example.com' && password === 'operator1234') {
            setUser(MOCK_SITE_ADMIN);
            setCurrentSiteId(1);
            setIsLoading(false);
            return true;
        }

        setIsLoading(false);
        return false;
    }, []);

    /**
     * 로그아웃
     */
    const logout = useCallback(() => {
        setUser(null);
        setCurrentSiteId(null);
        // 실제 구현 시: localStorage 정리, 리다이렉트
    }, []);

    /**
     * 현재 사이트 변경
     */
    const setCurrentSite = useCallback((siteId: number) => {
        setCurrentSiteId(siteId);
    }, []);

    /**
     * 접근 가능한 사이트 목록
     */
    const availableSites = useMemo(() => {
        if (!user) return [];
        if (user.role === 'PLATFORM_ADMIN') return MOCK_SITES;
        return MOCK_SITES.filter((site) => user.siteIds.includes(site.siteId));
    }, [user]);

    const value = useMemo<AuthContextType>(
        () => ({
            user,
            isAuthenticated: !!user,
            isLoading,
            currentSiteId,
            sites: availableSites,
            login,
            logout,
            setCurrentSite,
        }),
        [user, isLoading, currentSiteId, availableSites, login, logout, setCurrentSite]
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
