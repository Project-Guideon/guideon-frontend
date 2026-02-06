'use client';


import { StatCard } from './components/StatCard';
import {
    SiteComparisonChart,
    DeviceStatusChart,
    SuccessRateChart,
    QuestionTypeChart,
    HourlyTrafficChart
} from './components/DashboardCharts';
import { KioskMap } from './components/KioskMap';
import { RecentActivityLog } from './components/RecentActivityLog';
import {
    HiOutlineBuildingOffice2,
    HiOutlineUsers,
    HiOutlineServerStack,
    HiOutlineCpuChip
} from 'react-icons/hi2';

export function AdminDashboard() {
    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<HiOutlineBuildingOffice2 className="w-6 h-6" />}
                    label="제휴 관광지"
                    value="5"
                    subValue="신규 +1 (경복궁)"
                    color="blue"
                    isPositive={true}
                />
                <StatCard
                    icon={<HiOutlineServerStack className="w-6 h-6" />}
                    label="전체 디바이스"
                    value="159"
                    subValue="가동률 96.8%"
                    color="green"
                    isPositive={true}
                />
                <StatCard
                    icon={<HiOutlineCpuChip className="w-6 h-6" />}
                    label="일일 요청량"
                    value="3,582"
                    subValue="전일 대비 +15%"
                    color="orange"
                    isPositive={true}
                />
                <StatCard
                    icon={<HiOutlineUsers className="w-6 h-6" />}
                    label="활성 운영자"
                    value="12"
                    subValue="접속 중 4"
                    color="purple"
                    isPositive={true}
                />
            </div>

            {/* Main Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map (Larger) */}
                <div className="lg:col-span-2 relative h-[450px]">
                    <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 shadow-sm pointer-events-none">
                        🔴 Live: 에버랜드
                    </div>
                    <KioskMap />
                </div>
                {/* Logs (Side) */}
                <div className="h-[450px]">
                    <RecentActivityLog />
                </div>
            </div>

            {/* Traffic Analysis (Half & Half) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[350px]">
                    <SiteComparisonChart />
                </div>
                <div className="h-[350px]">
                    <HourlyTrafficChart />
                </div>
            </div>

            {/* Detailed Breakdown (3 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Success Rate */}
                <div className="h-[300px]">
                    <SuccessRateChart />
                </div>
                {/* Question Type */}
                <div className="h-[300px]">
                    <QuestionTypeChart />
                </div>
                {/* Device Status */}
                <div className="h-[300px]">
                    <DeviceStatusChart />
                </div>
            </div>
        </div>
    );
}
