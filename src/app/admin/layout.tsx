
import { AdminSidebarContainer } from '@/features/admin/presentation/components/AdminSidebarContainer';
import { AdminHeader } from '@/shared/components/layout/AdminHeader';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* 사이드바 */}
            <AdminSidebarContainer />

            {/* 메인 콘텐츠 영역 */}
            <div className="lg:ml-64">
                {/* 헤더 */}
                <AdminHeader />

                {/* 페이지 콘텐츠 */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
