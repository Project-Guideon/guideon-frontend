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

    // 이미 인증된 상태면 리다이렉트 대기
    if (isAuthenticated) {
        return null;
    }

    return (
        <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            errorMessage={errorMessage}
        />
    );
}
