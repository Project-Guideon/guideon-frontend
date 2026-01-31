import { Metadata } from 'next';
import { LoginForm } from '@/features/auth/presentation/components/LoginForm';

export const metadata: Metadata = {
    title: 'Login | GUIDEON Admin',
    description: 'GUIDEON 관리자 로그인 페이지',
};

export default function LoginPage() {
    return <LoginForm />;
}
