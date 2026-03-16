'use client';

import {
    HiOutlinePencilSquare,
    HiOutlineEnvelope,
    HiOutlineBuildingOffice2,
} from 'react-icons/hi2';
import type { SiteWithInvites, SiteInvite } from '@/features/site/domain/entities/Site';

interface SiteTableProps {
    sites: SiteWithInvites[];
    onEditSite: (site: SiteWithInvites) => void;
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
function OperatorBadges({ invites }: { invites: SiteInvite[] }) {
    const accepted = invites.filter((inv) => inv.status === 'ACCEPTED');
    const pending = invites.filter((inv) => inv.status === 'PENDING');

    if (accepted.length === 0 && pending.length === 0) {
        return (
            <span className="text-xs text-slate-300 font-medium italic">미배정</span>
        );
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {accepted.map((inv) => (
                <span
                    key={inv.inviteId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 max-w-[160px] truncate"
                    title={inv.email}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {inv.email.split('@')[0]}
                </span>
            ))}
            {pending.map((inv) => (
                <span
                    key={inv.inviteId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100 max-w-[160px] truncate"
                    title={`대기 중: ${inv.email}`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-pulse" />
                    {inv.email.split('@')[0]}
                </span>
            ))}
        </div>
    );
}

/**
 * SiteTable - 관광지 목록 테이블
 *
 * API 스펙 기준 - 삭제 없음, 활성/비활성 토글만 지원
 */
export function SiteTable({ sites, onEditSite, onToggleActive, onInviteOperator }: SiteTableProps) {
    if (sites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                    <HiOutlineBuildingOffice2 className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-500">등록된 관광지가 없습니다</p>
                <p className="text-xs text-slate-400 mt-1">새로운 관광지를 추가해보세요</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-16">ID</th>
                        <th className="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">관광지 이름</th>
                        <th className="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">운영자</th>
                        <th className="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-24">상태</th>
                        <th className="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-28">생성일</th>
                        <th className="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right w-28">작업</th>
                    </tr>
                </thead>
                <tbody>
                    {sites.map((site, index) => (
                        <tr
                            key={site.siteId}
                            className={`group transition-colors duration-150 hover:bg-orange-50/30 ${
                                index < sites.length - 1 ? 'border-b border-slate-50' : ''
                            }`}
                        >
                            {/* ID */}
                            <td className="px-5 py-4">
                                <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-slate-100 text-[11px] font-bold text-slate-500">
                                    {site.siteId}
                                </span>
                            </td>

                            {/* 관광지 이름 */}
                            <td className="px-5 py-4">
                                <span className="text-sm font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                                    {site.name}
                                </span>
                            </td>

                            {/* 운영자 */}
                            <td className="px-5 py-4">
                                <OperatorBadges invites={site.invites} />
                            </td>

                            {/* 상태 뱃지 - 클릭 시 토글 */}
                            <td className="px-5 py-4">
                                <button
                                    onClick={() => onToggleActive(site.siteId)}
                                    title={site.isActive ? '클릭하여 비활성화' : '클릭하여 활성화'}
                                >
                                    {site.isActive ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            활성
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100 transition-colors">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                            비활성
                                        </span>
                                    )}
                                </button>
                            </td>

                            {/* 생성일 */}
                            <td className="px-5 py-4">
                                <span className="text-xs font-medium text-slate-400">{formatDate(site.createdAt)}</span>
                            </td>

                            {/* 작업 버튼 */}
                            <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-0.5">
                                    <button
                                        onClick={() => onInviteOperator(site)}
                                        className="p-2 rounded-lg text-slate-300 hover:text-violet-600 hover:bg-violet-50 transition-all duration-200"
                                        title="운영자 초대"
                                        aria-label="운영자 초대"
                                    >
                                        <HiOutlineEnvelope className="w-[18px] h-[18px]" />
                                    </button>
                                    <button
                                        onClick={() => onEditSite(site)}
                                        className="p-2 rounded-lg text-slate-300 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200"
                                        title="수정"
                                        aria-label="관광지 수정"
                                    >
                                        <HiOutlinePencilSquare className="w-[18px] h-[18px]" />
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
