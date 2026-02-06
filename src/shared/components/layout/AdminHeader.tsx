'use client';

import { useAuth } from '@/features/auth/application/hooks/useAuth';
import {
    HiOutlineBell,
    HiOutlineUserCircle,
    HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';

export function AdminHeader() {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white border-b border-slate-100 h-16 px-6 flex items-center justify-between sticky top-0 z-20">
            {/* 좌측: 현재 위치/사이트 표시 */}
            <div className="flex items-center gap-4">
                <span className="text-slate-400 font-medium hidden md:block">
                    GuideON Admin
                </span>
                <span className="text-slate-300 hidden md:block">/</span>

                <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-lg">
                        전체 플랫폼 현황
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded font-medium">
                        Global View
                    </span>
                </div>
            </div>

            {/* 우측: 알림 및 프로필 */}
            <div className="flex items-center gap-4">
                {/* 알림 버튼 */}
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative">
                    <HiOutlineBell className="w-6 h-6" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* 프로필 드롭다운 */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-800 leading-tight">
                            {user?.email.split('@')[0]}
                        </p>
                        <p className="text-xs text-slate-500">
                            {user?.role === 'PLATFORM_ADMIN' ? '슈퍼 관리자' : '구역 관리자'}
                        </p>
                    </div>
                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                        <HiOutlineUserCircle className="w-6 h-6" />
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="로그아웃"
                    >
                        <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
