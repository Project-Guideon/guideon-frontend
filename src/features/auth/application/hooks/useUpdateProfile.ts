import { useState } from 'react';
import { useAuthContext } from '../store/AuthContext';

export function useUpdateProfile() {
    const { user } = useAuthContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateProfile = async (password: string, confirmPassword: string) => {
        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return false;
        }

        if (password.length < 8) {
            setError('비밀번호는 8자 이상이어야 합니다.');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            return true;
        } catch (err) {
            setError('정보 수정 중 오류가 발생했습니다.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { user, updateProfile, isLoading, error };
}