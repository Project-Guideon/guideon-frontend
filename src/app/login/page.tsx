'use client';

import { useRouter } from 'next/navigation';
import { LoginForm } from '@/features/auth/presentation/components/LoginForm';
import { useAuth } from '@/features/auth/application/hooks/useAuth';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAuth();

    const handleLogin = async (email: string, password: string) => {
        const success = await login(email, password);
        if (success) {
            router.push('/admin');
        } else {
            alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
        }
    };

    return <LoginForm onSubmit={handleLogin} isLoading={isLoading} />;
}
