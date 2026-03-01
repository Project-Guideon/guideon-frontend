'use client';

import { HiOutlinePencilSquare, HiOutlineTrash, HiOutlineEnvelope } from 'react-icons/hi2';
import type { SiteWithInvites, SiteInvite } from '@/features/site/domain/entities/Site';

/**
 * SiteTableProps
 */
interface SiteTableProps {
    sites: SiteWithInvites[];
    onEditSite: (site: SiteWithInvites) => void;
    onDeleteSite: (site: SiteWithInvites) => void;
    onToggleActive: (siteId: number) => void;
    onInviteOperator: (site: SiteWithInvites) => void;
}

/**
 * 날짜 포맷 유틸 (ISO → YYYY.MM.DD)
 */
function formatDate(isoString: string): string {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

/**
 * 운영자 상태 뱃지 렌더링
 */
function renderOperatorBadge(invites: SiteInvite[]) {
    if (invites.length === 0) {
        return (
            <span className="text-xs text-slate-300 font-medium">미배정</span>
        );
    }

    const accepted = invites.filter((inv) => inv.status === 'ACCEPTED');
    const pending = invites.filter((inv) => inv.status === 'PENDING');

    return (
        <div className="flex flex-col gap-1">
            {accepted.map((inv) => (
                <span
                    key={inv.inviteId}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-600 max-w-[160px] truncate"
                    title={inv.email}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {inv.email}
                </span>
            ))}
            {pending.map((inv) => (
                <span
                    key={inv.inviteId}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-600 max-w-[160px] truncate"
                    title={`대기 중: ${inv.email}`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    {inv.email}
                </span>
            ))}
        </div>
    );
}

/**
 * SiteTable — 관광지 목록 테이블 컴포넌트
 *
 * 컬럼: ID, 관광지 이름, 운영자, 상태, 생성일, 작업
 */
export function SiteTable({ sites, onEditSite, onDeleteSite, onToggleActive, onInviteOperator }: SiteTableProps) {
    if (sites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <svg className="w-16 h-16 mb-4 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                    />
                </svg>
                <p className="text-sm font-bold">등록된 관광지가 없습니다</p>
                <p className="text-xs mt-1">새로운 관광지를 추가해보세요</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">관광지 이름</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">운영자</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">상태</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">생성일</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">작업</th>
                    </tr>
                </thead>
                <tbody>
                    {sites.map((site) => (
                        <tr
                            key={site.siteId}
                            className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group"
                        >
                            {/* ID */}
                            <td className="px-4 py-4">
                                <span className="text-xs font-bold text-slate-400">#{site.siteId}</span>
                            </td>

                            {/* 관광지 이름 */}
                            <td className="px-4 py-4">
                                <span className="text-sm font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                                    {site.name}
                                </span>
                            </td>

                            {/* 운영자 */}
                            <td className="px-4 py-4">
                                {renderOperatorBadge(site.invites)}
                            </td>

                            {/* 상태 뱃지 */}
                            <td className="px-4 py-4">
                                <button
                                    onClick={() => onToggleActive(site.siteId)}
                                    className="cursor-pointer"
                                    title={site.isActive ? '비활성화하려면 클릭' : '활성화하려면 클릭'}
                                >
                                    {site.isActive ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-600 border border-green-100 hover:bg-green-100 transition-colors">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            활성
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100 transition-colors">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                            비활성
                                        </span>
                                    )}
                                </button>
                            </td>

                            {/* 생성일 */}
                            <td className="px-4 py-4">
                                <span className="text-xs text-slate-500">{formatDate(site.createdAt)}</span>
                            </td>

                            {/* 작업 버튼 */}
                            <td className="px-4 py-4">
                                <div className="flex items-center justify-end gap-1">
                                    <button
                                        onClick={() => onInviteOperator(site)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all duration-200"
                                        title="운영자 초대"
                                    >
                                        <HiOutlineEnvelope className="w-4.5 h-4.5" />
                                    </button>
                                    <button
                                        onClick={() => onEditSite(site)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200"
                                        title="수정"
                                    >
                                        <HiOutlinePencilSquare className="w-4.5 h-4.5" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteSite(site)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                                        title="삭제"
                                    >
                                        <HiOutlineTrash className="w-4.5 h-4.5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
