'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineArrowPath, HiOutlineXCircle, HiOutlineExclamationCircle } from 'react-icons/hi2';
import { Invite } from '@/features/invite/domain/entities/InviteEntry';

interface InviteTableProps {
    invites: Invite[];
    onCancel: (id: number) => void;
    onResend: (id: number) => void;
}

export function InviteTable({ invites, onCancel, onResend }: InviteTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">대상 정보</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">상태</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">초대 일시</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">작업</th>
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence mode="popLayout">
                        {invites.map((invite) => (
                            <motion.tr 
                                key={invite.id} 
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
                                    <div className="flex flex-col items-center gap-1">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold 
                                            ${invite.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                              invite.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                              invite.status === 'REVOKED' ? 'bg-red-50 text-red-500 border-red-100' :
                                              'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                            {invite.status === 'PENDING' ? '대기 중' : 
                                             invite.status === 'ACCEPTED' ? '수락됨' : 
                                             invite.status === 'REVOKED' ? '취소됨' : '만료됨'}
                                        </span>
                                        {invite.errorMsg && (
                                            <span className="text-[10px] text-red-500 flex items-center gap-1 font-medium">
                                                <HiOutlineExclamationCircle className="w-3 h-3" /> 발송 실패
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-xs text-slate-500 font-medium">
                                    {invite.createdAt}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        {invite.status === 'PENDING' && (
                                            <button 
                                                onClick={() => onCancel(invite.id)} 
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" 
                                                title="초대 취소"
                                                aria-label={`${invite.email} 초대 취소`}
                                                >
                                                <HiOutlineXCircle className="w-5 h-5" />
                                            </button>
                                        )}
                                        {(invite.status === 'EXPIRED' || invite.status === 'REVOKED') && (
                                            <button onClick={() => onResend(invite.id)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all" title="재전송" aria-label={`${invite.email} 초대 재전송`}>
                                                <HiOutlineArrowPath className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
}