'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { InviteAcceptForm } from '@/features/invite/presentation/components/InviteAcceptForm';
import { useInviteAccept } from '@/features/invite/application/hooks/useInviteAccept';

/**
 * 초대 수락 페이지 내부 컴포넌트
 * useSearchParams를 사용하므로 Suspense 경계 내부에서 렌더링
 */
function InviteAcceptContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const { status, errorType, errorMessage, acceptInvite, clearError } = useInviteAccept();
    const [noToken, setNoToken] = useState(false);

    /** 토큰 없으면 로그인으로 리다이렉트 */
    useEffect(() => {
        if (!token) {
            setNoToken(true);
            const timer = setTimeout(() => router.replace('/login'), 2000);
            return () => clearTimeout(timer);
        }
    }, [token, router]);

    /** 성공 시 대시보드로 리다이렉트 */
    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => router.replace('/admin'), 2000);
            return () => clearTimeout(timer);
        }
    }, [status, router]);

    /** 비밀번호 제출 핸들러 */
    const handleSubmit = (password: string) => {
        if (!token) return;
        acceptInvite(token, password);
    };

    /** 토큰 없음 → 로딩 화면 후 리다이렉트 */
    if (noToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">유효하지 않은 링크입니다. 로그인 페이지로 이동합니다.</p>
                </div>
            </div>
        );
    }

    return (
        <InviteAcceptForm
            status={status}
            errorType={errorType}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
            onClearError={clearError}
        />
    );
}

/**
 * 초대 수락 페이지
 *
 * URL: /invite/accept?token={rawToken}
 * SMTP 이메일의 "초대 수락하기" 링크에서 진입
 */
export default function InviteAcceptPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-slate-500 font-medium">로딩 중...</p>
                    </div>
                </div>
            }
        >
            <InviteAcceptContent />
        </Suspense>
    );
}
