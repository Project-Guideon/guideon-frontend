'use client';

import { useState, useRef, useEffect } from 'react';
import { HiOutlineChevronDown, HiOutlineCheck } from 'react-icons/hi2';
import { useAuth, useSiteContext } from '@/features/auth/application/hooks/useAuth';

/**
 * AdminHeader
 */
export function AdminHeader() {
    const { user, isPlatformAdmin } = useAuth();
    const { currentSite, sites, setCurrentSite } = useSiteContext();
    const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    /**
     * 외부 클릭 시 드롭다운 닫기
     */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsSiteDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /**
     * 사이트 선택 핸들러
     */
    const handleSiteSelect = (siteId: number) => {
        setCurrentSite(siteId);
        setIsSiteDropdownOpen(false);
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            {/* 좌측: 페이지 타이틀 또는 빵 부스러기 */}
            <div className="flex items-center gap-4">
                {/* 모바일에서 사이드바 버튼 공간 확보 */}
                <div className="lg:hidden w-10" />

                <h1 className="text-lg font-semibold text-slate-900">
                    관리자 대시보드
                </h1>
            </div>

            {/* 우측: 사이트 선택 & 사용자 정보 */}
            <div className="flex items-center gap-4">
                {/* 사이트 선택 드롭다운 */}
                {sites.length > 0 && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            <span className="text-sm font-medium text-slate-700">
                                {currentSite?.name || '사이트 선택'}
                            </span>
                            <HiOutlineChevronDown
                                className={`w-4 h-4 text-slate-500 transition-transform ${isSiteDropdownOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {/* 드롭다운 메뉴 */}
                        {isSiteDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                                <div className="px-3 py-2 border-b border-slate-100">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                        관광지 선택
                                    </p>
                                </div>
                                <div className="py-1 max-h-64 overflow-y-auto">
                                    {sites.map((site) => (
                                        <button
                                            key={site.siteId}
                                            onClick={() => handleSiteSelect(site.siteId)}
                                            className={`
                                                w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors
                                                ${currentSite?.siteId === site.siteId
                                                    ? 'bg-[#FF6B52]/10 text-[#FF6B52]'
                                                    : 'hover:bg-slate-50 text-slate-700'
                                                }
                                                ${!site.isActive ? 'opacity-50' : ''}
                                            `}
                                            disabled={!site.isActive}
                                        >
                                            <div>
                                                <span className="font-medium">{site.name}</span>
                                                {!site.isActive && (
                                                    <span className="ml-2 text-xs text-slate-400">(비활성)</span>
                                                )}
                                            </div>
                                            {currentSite?.siteId === site.siteId && (
                                                <HiOutlineCheck className="w-4 h-4" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 사용자 정보 (데스크탑) */}
                {user && (
                    <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B52] to-[#e55a43] rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                                {user.email[0].toUpperCase()}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-slate-900 leading-tight">
                                {user.email.split('@')[0]}
                            </p>
                            <p className="text-xs text-slate-500">
                                {isPlatformAdmin ? '플랫폼 관리자' : '사이트 관리자'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
