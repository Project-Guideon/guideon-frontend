'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineBuildingLibrary,
    HiOutlinePlusCircle,
    HiOutlineMagnifyingGlass,
    HiOutlineArrowPath,
    HiOutlineExclamationTriangle,
    HiChevronDown,
    HiChevronLeft,
    HiChevronRight,
} from 'react-icons/hi2';
import { useSites } from '@/features/site/application/hooks/useSites';
import { SiteTable } from './SiteTable';
import { SiteFormModal } from './SiteFormModal';
import { SiteToggleDialog } from './SiteToggleDialog';
import { SiteInviteModal } from './SiteInviteModal';
import type { SiteWithInvites } from '@/features/site/domain/entities/Site';

/**
 * 활성 상태 필터 옵션
 */
type ActiveStatusOption = 'all' | 'active' | 'inactive';

const STATUS_OPTIONS: { value: ActiveStatusOption; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'active', label: '활성' },
    { value: 'inactive', label: '비활성' },
];

/**
 * 관광지 관리 전체 뷰
 *
 * API 연동 - 삭제 기능 없음 (API 스펙에 DELETE 미존재)
 * 활성/비활성 토글, 생성/수정, 운영자 초대 지원
 */
export function SiteListView() {
    const {
        sitesWithInvites,
        totalSites,
        isLoading,
        error,
        filter,
        updateFilter,
        page,
        setPage,
        totalPages,
        createSite,
        updateSite,
        toggleSiteActive,
        inviteSiteAdmin,
    } = useSites();

    // 모달 상태
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [editTarget, setEditTarget] = useState<SiteWithInvites | null>(null);

    // 토글 다이얼로그 상태
    const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
    const [toggleTarget, setToggleTarget] = useState<SiteWithInvites | null>(null);

    // 초대 모달 상태
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteTarget, setInviteTarget] = useState<SiteWithInvites | null>(null);

    // 상태 필터 드롭다운
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    // 이벤트 핸들러

    const handleClickCreate = () => {
        setFormMode('create');
        setEditTarget(null);
        setIsFormModalOpen(true);
    };

    const handleClickEdit = (site: SiteWithInvites) => {
        setFormMode('edit');
        setEditTarget(site);
        setIsFormModalOpen(true);
    };

    const handleClickToggle = (siteId: number) => {
        const target = sitesWithInvites.find((site) => site.siteId === siteId) ?? null;
        if (!target) return;
        setToggleTarget(target);
        setIsToggleDialogOpen(true);
    };

    const handleClickInvite = (site: SiteWithInvites) => {
        setInviteTarget(site);
        setIsInviteModalOpen(true);
    };

    const handleSubmitInvite = (email: string) => {
        if (inviteTarget) {
            inviteSiteAdmin(inviteTarget.siteId, email);
        }
    };

    const handleConfirmToggle = () => {
        if (toggleTarget) {
            toggleSiteActive(toggleTarget.siteId);
        }
    };

    const handleSubmitForm = (name: string) => {
        if (formMode === 'create') {
            createSite({ name });
        } else if (editTarget) {
            updateSite(editTarget.siteId, { name });
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* 페이지 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <HiOutlineBuildingLibrary className="w-7 h-7 text-orange-500" />
                        관광지 관리
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        등록된 관광지를 관리합니다.{' '}
                        {!isLoading && (
                            <>총 <span className="font-bold text-orange-600">{totalSites}</span>개</>
                        )}
                    </p>
                </div>
                <button
                    onClick={handleClickCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm
                        hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all duration-200 active:scale-[0.98]"
                >
                    <HiOutlinePlusCircle className="w-5 h-5" />
                    관광지 추가
                </button>
            </div>

            {/* 에러 배너 */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-100 rounded-2xl px-5 py-3 flex items-center gap-3"
                >
                    <HiOutlineExclamationTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-sm font-medium text-red-600 flex-1">{error}</p>
                </motion.div>
            )}

            {/* 필터 영역 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                    {/* 검색 */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-500 whitespace-nowrap">검색</span>
                        <div className="relative group w-56">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center text-slate-500 group-hover:text-orange-600 transition-colors pointer-events-none">
                                <HiOutlineMagnifyingGlass className="w-3.5 h-3.5" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                value={filter.searchTerm}
                                onChange={(event) => updateFilter({ searchTerm: event.target.value })}
                                placeholder="관광지 이름 검색"
                                aria-label="관광지 이름 검색"
                                className="w-full h-[36px] pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium outline-none transition-all duration-200 hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                            />
                        </div>
                    </div>

                    <div className="w-px h-8 bg-slate-200 hidden md:block" />

                    {/* 상태 필터 */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-500 whitespace-nowrap">상태</span>
                        <div className="relative">
                            <button
                                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                aria-expanded={isStatusDropdownOpen}
                                aria-haspopup="listbox"
                                aria-controls="status-filter-menu"
                                className={`flex items-center gap-2 px-3 py-1.5 bg-white border rounded-xl transition-all duration-200 outline-none h-[36px]
                                    ${isStatusDropdownOpen
                                        ? 'border-orange-500 ring-4 ring-orange-50 text-slate-800'
                                        : 'border-slate-200 hover:border-orange-400 text-slate-600 hover:bg-orange-50'
                                    }
                                `}
                            >
                                <span className="text-xs font-bold min-w-[40px] text-left">
                                    {STATUS_OPTIONS.find((option) => option.value === filter.activeStatus)?.label}
                                </span>
                                <HiChevronDown
                                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180 text-orange-500' : ''}`}
                                />
                            </button>

                            <AnimatePresence>
                                {isStatusDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsStatusDropdownOpen(false)} />
                                        <motion.div
                                            id="status-filter-menu"
                                            role="listbox"
                                            aria-label="상태 필터"
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-32 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden p-1"
                                        >
                                            {STATUS_OPTIONS.map((option) => (
                                                <button
                                                    key={option.value}
                                                    role="option"
                                                    aria-selected={filter.activeStatus === option.value}
                                                    onClick={() => {
                                                        updateFilter({ activeStatus: option.value });
                                                        setIsStatusDropdownOpen(false);
                                                    }}
                                                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors
                                                        ${filter.activeStatus === option.value
                                                            ? 'bg-orange-50 text-orange-700 font-bold'
                                                            : 'text-slate-600 hover:bg-slate-50 hover:text-orange-600 font-medium'
                                                        }
                                                    `}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* 테이블 + 페이지네이션 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-sm font-medium text-slate-400">관광지 목록을 불러오는 중...</p>
                    </div>
                ) : error && sitesWithInvites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                            <HiOutlineExclamationTriangle className="w-7 h-7 text-red-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-600 mb-1">데이터를 불러올 수 없습니다</p>
                        <p className="text-xs text-slate-400 mb-5">네트워크 연결을 확인하고 다시 시도해주세요</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-bold text-xs hover:bg-orange-600 transition-all active:scale-[0.98]"
                        >
                            <HiOutlineArrowPath className="w-4 h-4" />
                            새로고침
                        </button>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={page}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <SiteTable
                                sites={sitesWithInvites}
                                onEditSite={handleClickEdit}
                                onToggleActive={handleClickToggle}
                                onInviteOperator={handleClickInvite}
                            />
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* 페이지네이션 */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-50">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 0}
                            aria-label="이전 페이지"
                            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-200"
                        >
                            <HiChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setPage(index)}
                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200
                                        ${page === index
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-105'
                                            : 'text-slate-500 hover:bg-orange-50 hover:text-orange-600'
                                        }
                                    `}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages - 1}
                            aria-label="다음 페이지"
                            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-200"
                        >
                            <HiChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* 생성/수정 모달 */}
            <SiteFormModal
                key={isFormModalOpen ? `${formMode}-${editTarget?.siteId ?? 'new'}` : 'closed'}
                isOpen={isFormModalOpen}
                mode={formMode}
                initialName={editTarget?.name ?? ''}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleSubmitForm}
            />

            {/* 활성/비활성 토글 확인 다이얼로그 */}
            <SiteToggleDialog
                isOpen={isToggleDialogOpen}
                siteName={toggleTarget?.name ?? ''}
                currentlyActive={toggleTarget?.isActive ?? true}
                onClose={() => setIsToggleDialogOpen(false)}
                onConfirm={handleConfirmToggle}
            />

            {/* 운영자 초대 모달 */}
            <SiteInviteModal
                key={isInviteModalOpen ? `invite-${inviteTarget?.siteId}` : 'invite-closed'}
                isOpen={isInviteModalOpen}
                siteName={inviteTarget?.name ?? ''}
                onClose={() => setIsInviteModalOpen(false)}
                onSubmit={handleSubmitInvite}
            />
        </div>
    );
}
