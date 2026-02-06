'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HiOutlineHome,
    HiOutlineBuildingOffice2,
    HiOutlineMapPin,
    HiOutlineMap,
    HiOutlineDeviceTablet,
    HiOutlineDocumentText,
    HiOutlineClipboardDocumentList,
    HiOutlineArrowRightOnRectangle,
    HiOutlineBars3,
    HiOutlineXMark,
} from 'react-icons/hi2';
import { useAuth, useSiteContext } from '@/features/auth/application/hooks/useAuth';

/**
 * 메뉴 아이템 타입
 */
interface MenuItem {
    id: string;
    label: string;
    href: string;
    icon: React.ElementType;
    requiredRole?: 'PLATFORM_ADMIN' | 'SITE_ADMIN' | 'ALL';
}

/**
 * 메뉴 정의
 */
const MENU_ITEMS: MenuItem[] = [
    { id: 'dashboard', label: '대시보드', href: '/admin', icon: HiOutlineHome, requiredRole: 'ALL' },
    { id: 'sites', label: '관광지 관리', href: '/admin/sites', icon: HiOutlineBuildingOffice2, requiredRole: 'PLATFORM_ADMIN' },
    { id: 'zones', label: '구역 관리', href: '/admin/zones', icon: HiOutlineMap, requiredRole: 'ALL' },
    { id: 'places', label: '장소 관리', href: '/admin/places', icon: HiOutlineMapPin, requiredRole: 'ALL' },
    { id: 'devices', label: '디바이스', href: '/admin/devices', icon: HiOutlineDeviceTablet, requiredRole: 'ALL' },
    { id: 'documents', label: '문서 관리', href: '/admin/documents', icon: HiOutlineDocumentText, requiredRole: 'ALL' },
];

const BOTTOM_MENU: MenuItem[] = [
    { id: 'logs', label: '감사 로그', href: '/admin/logs', icon: HiOutlineClipboardDocumentList, requiredRole: 'ALL' },
];

/**
 * AdminSidebar
 */
export function AdminSidebar() {
    const pathname = usePathname();
    const { user, logout, isPlatformAdmin } = useAuth();
    const { currentSite } = useSiteContext();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    /**
     * 메뉴 필터링 (역할 기반)
     */
    const filterMenuByRole = (items: MenuItem[]) => {
        return items.filter((item) => {
            if (item.requiredRole === 'ALL') return true;
            if (item.requiredRole === 'PLATFORM_ADMIN' && isPlatformAdmin) return true;
            if (item.requiredRole === 'SITE_ADMIN' && !isPlatformAdmin) return true;
            return false;
        });
    };

    const filteredMainMenu = filterMenuByRole(MENU_ITEMS);
    const filteredBottomMenu = filterMenuByRole(BOTTOM_MENU);

    /**
     * 메뉴 아이템 렌더링
     */
    const renderMenuItem = (item: MenuItem) => {
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
            <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive
                        ? 'bg-[#FF6B52] text-white shadow-lg shadow-[#FF6B52]/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                `}
            >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
            </Link>
        );
    };

    /**
     * 사이드바 컨텐츠
     */
    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* 로고 & 사이트 정보 */}
            <div className="p-6 border-b border-slate-200">
                <Link href="/admin" className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-bold text-slate-900">
                        GUIDE<span className="text-[#FF6B52]">ON</span>
                    </span>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        Admin
                    </span>
                </Link>

                {currentSite && (
                    <div className="text-sm">
                        <span className="text-slate-400">현재 관광지</span>
                        <p className="font-semibold text-slate-900 mt-1">{currentSite.name}</p>
                    </div>
                )}
            </div>

            {/* 메인 메뉴 */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {filteredMainMenu.map(renderMenuItem)}
            </nav>

            {/* 하단 메뉴 */}
            <div className="p-4 border-t border-slate-200 space-y-1">
                {filteredBottomMenu.map(renderMenuItem)}

                {/* 로그아웃 버튼 */}
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                    <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                    <span className="font-medium">로그아웃</span>
                </button>
            </div>

            {/* 사용자 정보 */}
            {user && (
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {user.role === 'PLATFORM_ADMIN' ? '플랫폼 관리자' : '사이트 관리자'}
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* 모바일 햄버거 버튼 */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
            >
                <HiOutlineBars3 className="w-6 h-6 text-slate-600" />
            </button>

            {/* 데스크탑 사이드바 */}
            <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-40">
                {sidebarContent}
            </aside>

            {/* 모바일 오버레이 */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* 모바일 사이드바 */}
            <aside
                className={`
                    lg:hidden fixed left-0 top-0 h-screen w-64 bg-white z-50 transform transition-transform duration-300
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg"
                >
                    <HiOutlineXMark className="w-5 h-5 text-slate-600" />
                </button>
                {sidebarContent}
            </aside>
        </>
    );
}
