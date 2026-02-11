'use client';

import { useAuth, useSiteContext } from '@/features/auth/application/hooks/useAuth';
import { AdminSidebar } from '@/shared/components/layout/AdminSidebar';

/**
 * AdminSidebarContainer — Feature Layer에서 인증 데이터를 가져와 AdminSidebar에 주입
 *
 * 이 컨테이너를 통해 Shared Layer의 AdminSidebar는 Feature에 의존하지 않으면서,
 * 실제 인증 데이터를 사용할 수 있습니다 (의존성 역전 해결).
 */
export function AdminSidebarContainer() {
    const { user, logout, isPlatformAdmin } = useAuth();
    const { currentSite } = useSiteContext();

    return (
        <AdminSidebar
            user={user}
            currentSite={currentSite}
            isPlatformAdmin={isPlatformAdmin}
            onLogout={logout}
        />
    );
}
