'use client';

import { useState, useEffect } from 'react';
import { HiOutlineLockClosed, HiOutlineEnvelope, HiOutlineUser, HiOutlineShieldCheck } from 'react-icons/hi2';
import { useUpdateProfile } from '../../application/hooks/useUpdateProfile';

export function UpdateProfile() {
    const { user, updateProfile, isLoading, error } = useUpdateProfile();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        const success = await updateProfile(password, confirmPassword);
        if (success) {
            setSuccessMessage('비밀번호가 안전하게 변경되었습니다.');
            setPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* 상단 헤더 영역 */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">계정 설정</h1>
                <p className="text-slate-500 mt-1">관리자 개인 정보를 확인하고 비밀번호를 변경할 수 있습니다.</p>
            </div>

            <div className="grid gap-6">
                {/* 프로필 정보 카드 (Read-only) */}
                <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <HiOutlineUser className="w-4 h-4 text-orange-500" />
                            기본 정보
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">이메일 계정</label>
                            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                <HiOutlineEnvelope className="w-5 h-5 text-slate-400" />
                                <span className="text-sm font-medium">{user?.email}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">관리자 권한</label>
                            <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100">
                                {user?.role === 'PLATFORM_ADMIN' ? '플랫폼 관리자' : '사이트 운영자'}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 비밀번호 변경 카드 */}
                <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <HiOutlineLockClosed className="w-4 h-4 text-orange-500" />
                            비밀번호 변경
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">새 비밀번호</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    placeholder="8자 이상 입력"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">비밀번호 확인</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    placeholder="다시 한번 입력"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs mt-2 font-medium flex items-center gap-2">
                                <span> {error}</span>
                            </div>
                        )}
                        {successMessage && (
                            <div className="p-3 rounded-lg bg-green-50 text-green-600 text-xs mt-2 font-bold flex items-center gap-2">
                                <HiOutlineShieldCheck className="w-4 h-4" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 disabled:bg-slate-300 transition-colors shadow-sm"
                            >
                                {isLoading ? '처리 중...' : '변경 내용 저장'}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}