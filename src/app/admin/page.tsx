'use client';

import { useAuth, useSiteContext } from '@/features/auth/application/hooks/useAuth';
import { StatCard } from './components/StatCard';
import { AiUsageChart, DeviceStatusChart, SuccessRateChart, QuestionTypeChart } from './components/DashboardCharts';
import { KioskMap } from './components/KioskMap';
import { RecentActivityLog } from './components/RecentActivityLog';
import {
    HiOutlineBuildingLibrary,
    HiOutlineMapPin,
    HiOutlineDeviceTablet,
    HiOutlineChatBubbleLeftRight
} from 'react-icons/hi2';

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const { currentSite, sites } = useSiteContext();

    const username = user?.email.split('@')[0] || 'Admin';

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        안녕하세요, {username}님! 👋
                    </h1>
                    <p className="text-slate-500 mt-1">
                        <span className="font-semibold text-[#FF6B52]">{currentSite?.name}</span> 관리 현황입니다.
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-slate-400">Date</p>
                    <p className="text-lg font-bold text-slate-900 uppercase">
                        {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
                    </p>
                </div>
            </div>

            {/* 2. Key Metrics (Stat Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<HiOutlineBuildingLibrary className="w-6 h-6" />}
                    label="등록된 관광지"
                    value={sites.length}
                    color="blue"
                    subValue="변동 없음"
                    isPositive={true}
                />
                <StatCard
                    icon={<HiOutlineMapPin className="w-6 h-6" />}
                    label="활성 장소 (POI)"
                    value="156"
                    color="green"
                    subValue="전일 +2"
                    isPositive={true}
                />
                <StatCard
                    icon={<HiOutlineDeviceTablet className="w-6 h-6" />}
                    label="키오스크 상태"
                    value="42/45"
                    color="purple"
                    subValue="2대 점검중"
                    isPositive={false}
                />
                <StatCard
                    icon={<HiOutlineChatBubbleLeftRight className="w-6 h-6" />}
                    label="오늘의 AI 응답"
                    value="1,240"
                    color="orange"
                    subValue="전일 +12%"
                    isPositive={true}
                />
            </div>

            {/* 3. Main Dashboard Layout (Masonry-like Grid) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Column 1 (Left): Map & Logs (높이 확장성 좋음) */}
                <div className="xl:col-span-2 space-y-6 flex flex-col">
                    {/* 키오스크 지도 - 고정 높이 */}
                    <KioskMap />

                    {/* 최근 로그 - 남은 공간 채우기 (flex-1) */}
                    <div className="flex-1 min-h-[400px]">
                        <RecentActivityLog />
                    </div>
                </div>

                {/* Column 2 (Right): Charts Stack (고정된 높이들의 합) */}
                <div className="space-y-6">
                    {/* AI 사용량 (가장 중요) */}
                    <div className="h-[350px]">
                        <AiUsageChart />
                    </div>

                    {/* 답변 성공률 */}
                    <div className="h-[280px]">
                        <SuccessRateChart />
                    </div>

                    {/* 질문 유형 */}
                    <div className="h-[320px]">
                        <QuestionTypeChart />
                    </div>

                    {/* 디바이스 상태 */}
                    <div className="h-[320px]">
                        <DeviceStatusChart />
                    </div>
                </div>
            </div>
        </div>
    );
}
