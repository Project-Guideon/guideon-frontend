'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineArrowPath, HiOutlineXCircle } from 'react-icons/hi2';
import type { Invite } from '@/features/invite/domain/entities/InviteEntry';

interface InviteTableProps {
    invites: Invite[];
    isLoading: boolean;
    isMutating: boolean;
    onExpire: (inviteId: number) => Promise<void>;
    onResend: (inviteId: number) => Promise<void>;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    PENDING: { label: '대기 중', className: 'bg-amber-50 text-amber-600 border-amber-100' },
    USED: { label: '수락됨', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    EXPIRED: { label: '만료됨', className: 'bg-slate-50 text-slate-400 border-slate-200' },
};

const DEFAULT_STATUS = { label: '알 수 없음', className: 'bg-slate-50 text-slate-400 border-slate-200' };

function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function InviteTable({ invites, isLoading, isMutating, onExpire, onResend }: InviteTableProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                    <span className="text-sm font-medium text-slate-400">초대 목록을 불러오는 중...</span>
                </div>
            </div>
        );
    }

    if (invites.length === 0) {
        return (
            <div className="flex items-center justify-center py-16">
                <span className="text-sm font-medium text-slate-400">초대 내역이 없습니다.</span>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">대상 정보</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">상태</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">초대 일시</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">만료 일시</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">작업</th>
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence mode="popLayout">
                        {invites.map((invite) => {
                            const statusInfo = STATUS_MAP[invite.status] ?? DEFAULT_STATUS;
                            return (
                                <motion.tr
                                    key={invite.inviteId}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800">{invite.email}</span>
                                            <span className="text-[11px] font-bold text-orange-500 uppercase">{invite.siteName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusInfo.className}`}>
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-xs text-slate-500 font-medium">
                                        {formatDateTime(invite.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-center text-xs text-slate-500 font-medium">
                                        {formatDateTime(invite.expiresAt)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            {invite.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => onResend(invite.inviteId)}
                                                        disabled={isMutating}
                                                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all disabled:opacity-50"
                                                        title="재발송"
                                                        aria-label={`${invite.email} 초대 재발송`}
                                                    >
                                                        <HiOutlineArrowPath className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => onExpire(invite.inviteId)}
                                                        disabled={isMutating}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                                        title="초대 철회"
                                                        aria-label={`${invite.email} 초대 철회`}
                                                    >
                                                        <HiOutlineXCircle className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
}
