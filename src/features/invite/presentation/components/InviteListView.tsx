'use client';

import { useState } from 'react';
import { HiOutlineEnvelope, HiOutlineMagnifyingGlass, HiOutlineExclamationTriangle, HiChevronDown } from 'react-icons/hi2';
import { useInvites } from '../../application/hooks/useInvites';
import { InviteTable } from './InviteTable';

export function InviteListView() { 
    const { invites, cancelInvite, resendInvite } = useInvites();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <HiOutlineEnvelope className="w-7 h-7 text-orange-500" /> 초대 관리
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">등록된 운영자 초대 내역을 관리합니다.</p>
                </div>
            </div>

            {/* 에러 문구 영역 */}
            {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3">
                    <HiOutlineExclamationTriangle className="w-5 h-5 text-red-500" />
                    <p className="text-sm font-bold text-red-600">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-xs font-bold text-red-400">닫기</button>
                </div>
            )}

            {/* 필터 영역 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-500 whitespace-nowrap">검색</span>
                    <div className="relative group w-64">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <HiOutlineMagnifyingGlass className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="이메일 또는 관광지명"
                            className="w-full h-[36px] pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-orange-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-500">상태</span>
                    <div className="relative">
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                        >
                            {statusFilter === 'ALL' ? '전체' : statusFilter}
                            <HiChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute top-full mt-2 w-32 bg-white border border-slate-100 rounded-xl shadow-xl z-50 p-1">
                                {['ALL', 'PENDING', 'ACCEPTED', 'EXPIRED'].map((s) => (
                                    <button 
                                        key={s} 
                                        onClick={() => { setStatusFilter(s); setIsDropdownOpen(false); }}
                                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold hover:bg-orange-50 hover:text-orange-600"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <InviteTable 
                    invites={invites} 
                    onCancel={cancelInvite} 
                    onResend={resendInvite} 
                />
            </div>
        </div>
    );
}