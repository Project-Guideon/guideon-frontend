import { UpdateProfile } from '@/features/auth/presentation/components/UpdateProfile';

export default function ProfilePage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-6">
            <UpdateProfile />
        </div>
    );
}