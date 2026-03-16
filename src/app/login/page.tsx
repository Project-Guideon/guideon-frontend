'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/features/auth/presentation/components/LoginForm';
import { useAuth } from '@/features/auth/application/hooks/useAuth';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading, isAuthenticated } = useAuth();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // 이미 로그인된 사용자는 대시보드로 리다이렉트
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/admin');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleLogin = async (email: string, password: string) => {
        setErrorMessage(null);
        const success = await login(email, password);
        if (success) {
            router.push('/admin');
        } else {
            setErrorMessage('이메일 또는 비밀번호가 올바르지 않습니다.');
        }
    };

    // 세션 복원 중이거나 이미 인증된 상태면 로딩 UI 표시
    if (isLoading || isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            errorMessage={errorMessage}
        />
    );
}
