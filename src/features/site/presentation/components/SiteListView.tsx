'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBuildingLibrary, HiOutlinePlusCircle, HiOutlineMagnifyingGlass, HiChevronDown, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { useSites } from '@/features/site/application/hooks/useSites';
import { SiteTable } from './SiteTable';
import { SiteFormModal } from './SiteFormModal';
import { SiteDeleteDialog } from './SiteDeleteDialog';
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
 * 헤더, 필터, 테이블, 페이지네이션, 모달을 조합하는 프레젠테이션 컴포넌트
 */
export function SiteListView() {
    const {
        sitesWithInvites,
        totalSites,
        filter,
        updateFilter,
        page,
        setPage,
        totalPages,
        createSite,
        updateSite,
        toggleSiteActive,
        deleteSite,
        inviteSiteAdmin,
    } = useSites();

    // 모달 상태
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [editTarget, setEditTarget] = useState<SiteWithInvites | null>(null);

    // 삭제 다이얼로그 상태
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<SiteWithInvites | null>(null);

    // 토글 다이얼로그 상태
    const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
    const [toggleTarget, setToggleTarget] = useState<SiteWithInvites | null>(null);

    // 초대 모달 상태
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteTarget, setInviteTarget] = useState<SiteWithInvites | null>(null);

    // 상태 필터 드롭다운
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    // ───────────── 이벤트 핸들러 ─────────────

    /** 관광지 추가 버튼 클릭 */
    const handleClickCreate = () => {
        setFormMode('create');
        setEditTarget(null);
        setIsFormModalOpen(true);
    };

    /** 관광지 수정 버튼 클릭 */
    const handleClickEdit = (site: SiteWithInvites) => {
        setFormMode('edit');
        setEditTarget(site);
        setIsFormModalOpen(true);
    };

    /** 관광지 삭제 버튼 클릭 */
    const handleClickDelete = (site: SiteWithInvites) => {
        setDeleteTarget(site);
        setIsDeleteDialogOpen(true);
    };

    /** 관광지 활성/비활성 토글 버튼 클릭 */
    const handleClickToggle = (siteId: number) => {
        const target = sitesWithInvites.find((site) => site.siteId === siteId) ?? null;
        setToggleTarget(target);
        setIsToggleDialogOpen(true);
    };

    /** 운영자 초대 버튼 클릭 */
    const handleClickInvite = (site: SiteWithInvites) => {
        setInviteTarget(site);
        setIsInviteModalOpen(true);
    };

    /** 초대 폼 제출 */
    const handleSubmitInvite = (email: string) => {
        if (inviteTarget) {
            inviteSiteAdmin(inviteTarget.siteId, email);
        }
    };

    /** 토글 확인 */
    const handleConfirmToggle = () => {
        if (toggleTarget) {
            toggleSiteActive(toggleTarget.siteId);
        }
    };

    /** 모달 폼 제출 */
    const handleSubmitForm = (name: string) => {
        if (formMode === 'create') {
            createSite({ name });
        } else if (editTarget) {
            updateSite(editTarget.siteId, { name });
        }
    };

    /** 삭제 확인 */
    const handleConfirmDelete = () => {
        if (deleteTarget) {
            deleteSite(deleteTarget.siteId);
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
                        등록된 관광지를 관리합니다. 총 <span className="font-bold text-orange-600">{totalSites}</span>개
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

            {/* 필터 영역 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                    {/* 검색 */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-500 whitespace-nowrap">검색</span>
                        <div className="relative group w-56">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center text-slate-500 group-hover:text-orange-600 transition-colors pointer-events-none">
                                <HiOutlineMagnifyingGlass className="w-3.5 h-3.5" />
                            </div>
                            <input
                                type="text"
                                value={filter.searchTerm}
                                onChange={(event) => updateFilter({ searchTerm: event.target.value })}
                                placeholder="관광지 이름 검색"
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

                            {/* 드롭다운 메뉴 */}
                            <div className={`absolute right-0 mt-2 w-32 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top-right
                                ${isStatusDropdownOpen
                                    ? 'opacity-100 scale-100 translate-y-0 visible'
                                    : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
                                }
                            `}>
                                <div className="p-1">
                                    {STATUS_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 테이블 + 페이지네이션 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={page}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <SiteTable
                            sites={sitesWithInvites}
                            onEditSite={handleClickEdit}
                            onDeleteSite={handleClickDelete}
                            onToggleActive={handleClickToggle}
                            onInviteOperator={handleClickInvite}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-50">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 0}
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

            {/* 삭제 확인 다이얼로그 */}
            <SiteDeleteDialog
                isOpen={isDeleteDialogOpen}
                siteName={deleteTarget?.name ?? ''}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
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
