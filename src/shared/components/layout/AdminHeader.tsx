'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/features/auth/application/hooks/useAuth';
import {
    HiOutlineBell,
    HiOutlineUserCircle,
    HiOutlineArrowRightOnRectangle,
    HiOutlineCheckCircle,
    HiOutlineExclamationTriangle,
    HiOutlineInformationCircle
} from 'react-icons/hi2';

interface Notification {
    id: number;
    type: 'info' | 'warning' | 'success';
    title: string;
    message: string;
    time: string;
    isRead: boolean;
}

// 알림창 mock 데이터
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 1,
        type: 'warning',
        title: '디바이스 연결 끊김',
        message: '에버랜드: KIOSK-05 (사파리 입구) 응답 없음',
        time: '방금 전',
        isRead: false
    },
    {
        id: 2,
        type: 'info',
        title: '신규 관광지 승인 요청',
        message: "'제주 민속촌' 사이트 생성 승인 대기 중",
        time: '30분 전',
        isRead: false
    },
    {
        id: 3,
        type: 'success',
        title: '데이터 동기화 완료',
        message: '모든 구역(Zone) 정보가 최신 버전으로 업데이트되었습니다.',
        time: '2시간 전',
        isRead: true
    },
    {
        id: 4,
        type: 'info',
        title: '운영자 초대 수락',
        message: '관리자(admin@everland.com)님이 초대를 수락했습니다.',
        time: '5시간 전',
        isRead: true
    }
];

export function AdminHeader() {
    const { user, logout } = useAuth();
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const notiDropdownRef = useRef<HTMLDivElement>(null);

    // 외부 클릭 시 닫기
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notiDropdownRef.current && !notiDropdownRef.current.contains(event.target as Node)) {
                setIsNotiOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;

    return (
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-2000">
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
                {/* 알림 버튼 & 드롭다운 */}
                <div className="relative" ref={notiDropdownRef}>
                    <button
                        onClick={() => setIsNotiOpen(!isNotiOpen)}
                        className={`p-2 rounded-full transition-all duration-200 relative 
                            ${isNotiOpen ? 'bg-orange-50 text-orange-600 ring-2 ring-orange-100' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'}
                        `}
                    >
                        <HiOutlineBell className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                        )}
                    </button>

                    {/* 알림 드롭다운 메뉴 */}
                    <div
                        className={`absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 origin-top-right transition-all duration-200 ease-out
                            ${isNotiOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}
                        `}
                    >
                        <div className="px-5 py-3 border-b border-slate-50 flex justify-between items-center bg-white rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800 text-base">알림</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {unreadCount} NEW
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-slate-400 font-medium cursor-pointer hover:text-orange-600 transition-colors">모두 읽음</span>
                        </div>

                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                            {MOCK_NOTIFICATIONS.map((noti) => (
                                <div
                                    key={noti.id}
                                    className={`px-5 py-4 border-b border-slate-50 last:border-0 transition-all cursor-pointer group
                                        ${!noti.isRead ? 'bg-orange-50/10' : 'bg-white'}
                                        hover:bg-orange-50
                                    `}
                                >
                                    <div className="flex gap-4">
                                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 transition-colors
                                            ${noti.type === 'warning' ? 'bg-red-100 text-red-500 group-hover:bg-red-200' : ''}
                                            ${noti.type === 'success' ? 'bg-green-100 text-green-500 group-hover:bg-green-200' : ''}
                                            ${noti.type === 'info' ? 'bg-blue-100 text-blue-500 group-hover:bg-blue-200' : ''}
                                        `}>
                                            {noti.type === 'warning' && <HiOutlineExclamationTriangle className="w-4 h-4" />}
                                            {noti.type === 'success' && <HiOutlineCheckCircle className="w-4 h-4" />}
                                            {noti.type === 'info' && <HiOutlineInformationCircle className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-orange-900 transition-colors">
                                                    {noti.title}
                                                </p>
                                                <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{noti.time}</span>
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 group-hover:text-slate-700">
                                                {noti.message}
                                            </p>
                                        </div>
                                        {!noti.isRead && (
                                            <div className="shrink-0 mt-2">
                                                <div className="w-2 h-2 rounded-full bg-orange-500 ring-4 ring-orange-100"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-4 py-3 border-t border-slate-50 text-center bg-slate-50/50 rounded-b-2xl">
                            <button className="text-xs text-slate-500 hover:text-orange-600 font-bold transition-colors flex items-center justify-center gap-1 mx-auto">
                                지난 알림 더보기
                            </button>
                        </div>
                    </div>
                </div>

                {/* 프로필 영역 (Sidebar 통일 디자인) */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-100 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors leading-tight">
                            {user?.email?.split('@')[0] ?? '사용자'}
                        </p>
                        <p className="text-xs text-slate-400 group-hover:text-orange-500 transition-colors font-medium mt-0.5">
                            {user?.role === 'PLATFORM_ADMIN' ? 'Platform Manager' : user?.role === 'SITE_ADMIN' ? 'Site Manager' : ''}
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 ring-2 ring-transparent group-hover:ring-orange-100 transition-all">
                        <HiOutlineUserCircle className="w-6 h-6" />
                    </div>
                    <button
                        onClick={logout}
                        className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="로그아웃"
                    >
                        <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
