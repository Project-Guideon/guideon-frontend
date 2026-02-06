'use client';

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import {
    HiOutlineGlobeAsiaAustralia,
    HiOutlineDeviceTablet,
    HiOutlineChatBubbleBottomCenterText,
    HiOutlineCheckCircle,
    HiOutlineClock
} from 'react-icons/hi2';

/**
 * Mock Data: 관광지별 AI 사용량 비교 (Top 5)
 */
const SITE_COMPARISON_DATA = [
    { name: '에버랜드', value: 1240, color: '#FF6B52' },
    { name: '경복궁', value: 850, color: '#FF9F43' },
    { name: '롯데월드', value: 720, color: '#FFCD56' },
    { name: '제주민속촌', value: 450, color: '#4BC0C0' },
    { name: '국립박물관', value: 320, color: '#36A2EB' },
];

/**
 * Mock Data: 시간대별 요청량 (Area Chart)
 */
const HOURLY_TRAFFIC_DATA = [
    { time: '09시', count: 120 },
    { time: '10시', count: 250 },
    { time: '11시', count: 480 },
    { time: '12시', count: 620 },
    { time: '13시', count: 580 },
    { time: '14시', count: 750 },
    { time: '15시', count: 680 },
    { time: '16시', count: 520 },
    { time: '17시', count: 340 },
    { time: '18시', count: 180 },
];

/**
 * Mock Data: 통합 디바이스 상태
 */
const DEVICE_STATUS_DATA = [
    { name: '정상', value: 142, full: '정상 (Online)', color: '#2ECCB7' },
    { name: '점검', value: 12, full: '점검 (Maintenance)', color: '#FF9F43' },
    { name: '장애', value: 5, full: '장애 (Error)', color: '#FF5252' },
];

/**
 * Mock Data: 통합 질문 유형
 */
const QUESTION_TYPE_DATA = [
    { name: '길안내', value: 45, color: '#3B82F6' },
    { name: '시설정보', value: 25, color: '#10B981' },
    { name: '운영시간', value: 15, color: '#F59E0B' },
    { name: '추천코스', value: 10, color: '#8B5CF6' },
    { name: '기타', value: 5, color: '#94A3B8' },
];

/**
 * Mock Data: 답변 성공률 (실패 색상 Red)
 */
const ANSWER_SUCCESS_DATA = [
    { name: '성공', value: 92, fill: '#3B82F6' },
    { name: '실패', value: 8, fill: '#FF5252' },
];

/**
 * SiteComparisonChart (Bar Chart)
 */
export function SiteComparisonChart() {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <HiOutlineGlobeAsiaAustralia className="w-5 h-5 text-slate-500" />
                <span>관광지별 트래픽 Top 5</span>
            </h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SITE_COMPARISON_DATA} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                            width={70}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar
                            dataKey="value"
                            radius={[0, 4, 4, 0]}
                            barSize={20}
                        >
                            {SITE_COMPARISON_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

/**
 * HourlyTrafficChart (Area Chart)
 */
export function HourlyTrafficChart() {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <HiOutlineClock className="w-5 h-5 text-slate-500" />
                <span>시간대별 요청량</span>
                <span className="ml-auto text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    Average
                </span>
            </h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={HOURLY_TRAFFIC_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                        />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorCount)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

/**
 * 디바이스 상태 차트
 */
export function DeviceStatusChart() {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
            <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                <HiOutlineDeviceTablet className="w-5 h-5 text-slate-500" />
                기기 상태
            </h3>

            <div className="flex-1 relative min-h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={DEVICE_STATUS_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={50}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {DEVICE_STATUS_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-slate-900">159</span>
                    <span className="text-[10px] text-slate-400">Total</span>
                </div>
            </div>

            <div className="mt-2 space-y-1">
                {DEVICE_STATUS_DATA.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-600 truncate">{item.name}</span>
                        </div>
                        <span className="font-semibold text-slate-900">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * 질문 유형 차트
 */
export function QuestionTypeChart() {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
            <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                <HiOutlineChatBubbleBottomCenterText className="w-5 h-5 text-slate-500" />
                질문 유형
            </h3>

            <div className="flex-1 min-h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={QUESTION_TYPE_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={50}
                            dataKey="value"
                        >
                            {QUESTION_TYPE_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
                {QUESTION_TYPE_DATA.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-600 truncate">{item.name}</span>
                        </div>
                        <span className="font-semibold text-slate-800">{item.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * 답변 성공률 차트 - Simplified (Failed Red Color, No Bar)
 */
export function SuccessRateChart() {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
            <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                <HiOutlineCheckCircle className="w-5 h-5 text-slate-500" />
                AI 답변 성공률
            </h3>

            <div className="flex-1 flex flex-col items-center justify-center">
                {/* Donut Chart */}
                <div className="w-32 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={ANSWER_SUCCESS_DATA}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={55}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                            >
                                {ANSWER_SUCCESS_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-blue-600">92%</span>
                    </div>
                </div>

                {/* Text Legend */}
                <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-slate-600">성공 (1,140)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-slate-600">실패 (100)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
