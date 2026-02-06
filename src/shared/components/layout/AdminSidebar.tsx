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
    HiOutlineBuildingLibrary,
    HiOutlineUserCircle
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
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                    ${isActive
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }
                `}
            >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className={`text-sm font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
            </Link>
        );
    };

    /**
     * 사이드바 컨텐츠
     */
    const sidebarContent = (
        <div className="flex flex-col h-full bg-white">
            {/* 로고 & 사이트 정보 */}
            <div className="px-6 pt-6 pb-4">
                <Link href="/admin" className="flex items-center gap-2 mb-6">
                    <span className="text-xl font-black text-slate-800 tracking-tight">
                        GUIDE<span className="text-orange-500">ON</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-200">
                        Admin
                    </span>
                </Link>

                {!isPlatformAdmin && currentSite && (
                    <div className="mt-6 px-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            Current Site
                        </p>
                        <div className="flex items-center justify-between group cursor-pointer">
                            <p className="text-base font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                                {currentSite.name}
                            </p>
                            <HiOutlineBuildingLibrary className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                        </div>
                    </div>
                )}
            </div>

            {/* 구분선 */}
            <div className="px-6 pb-2">
                <div className="h-px bg-slate-100"></div>
                <p className="mt-4 mb-2 text-xs font-bold text-slate-400 px-2">MENU</p>
            </div>

            {/* 메인 메뉴 */}
            <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto">
                {filteredMainMenu.map(renderMenuItem)}

                <div className="pt-4 pb-2">
                    <p className="mb-2 text-xs font-bold text-slate-400 px-2">SYSTEM</p>
                    {filteredBottomMenu.map(renderMenuItem)}
                </div>
            </nav>

            {/* 유저 프로필 */}
            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 ring-2 ring-white shadow-sm group-hover:ring-orange-200 transition-all">
                        <HiOutlineUserCircle className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate group-hover:text-slate-900">
                            {user?.email.split('@')[0]}
                        </p>
                        <p className="text-xs text-slate-400 font-medium truncate">
                            {user?.role === 'PLATFORM_ADMIN' ? 'Platform Manager' : 'Site Manager'}
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="로그아웃"
                    >
                        <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* 모바일 햄버거 버튼 */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-colors"
            >
                <HiOutlineBars3 className="w-6 h-6 text-slate-600" />
            </button>

            {/* 데스크탑 사이드바 */}
            <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-[1900]">
                {sidebarContent}
            </aside>

            {/* 모바일 오버레이 */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-slate-900/20 z-[2000] backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* 모바일 사이드바 */}
            <aside
                className={`
                    lg:hidden fixed left-0 top-0 h-screen w-64 bg-white z-[2100] transform transition-transform duration-300 shadow-2xl
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                >
                    <HiOutlineXMark className="w-5 h-5" />
                </button>
                {sidebarContent}
            </aside>
        </>
    );
}
