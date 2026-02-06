'use client';

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import {
    HiOutlineCpuChip,
    HiOutlineDeviceTablet,
    HiOutlineChatBubbleBottomCenterText,
    HiOutlineCheckCircle
} from 'react-icons/hi2';

/**
 * Mock Data: 최근 7일 AI 질의 응답 수
 */
const AI_USAGE_DATA = [
    { date: '2/1', count: 120 },
    { date: '2/2', count: 180 },
    { date: '2/3', count: 150 },
    { date: '2/4', count: 210 },
    { date: '2/5', count: 190 },
    { date: '2/6', count: 250 },
    { date: '2/7', count: 140 },
];

/**
 * Mock Data: 디바이스 상태
 */
const DEVICE_STATUS_DATA = [
    { name: '정상', value: 38, full: '정상 (Online)', color: '#2ECCB7' },
    { name: '주의', value: 5, full: '주의 (Slow)', color: '#FF9F43' },
    { name: '오프라인', value: 2, full: '오프라인 (Offline)', color: '#FF5252' },
];

/**
 * Mock Data: 질문 유형
 */
const QUESTION_TYPE_DATA = [
    { name: '길안내', value: 45, color: '#3B82F6' },
    { name: '시설정보', value: 25, color: '#10B981' },
    { name: '운영시간', value: 15, color: '#F59E0B' },
    { name: '추천코스', value: 10, color: '#8B5CF6' },
    { name: '기타', value: 5, color: '#94A3B8' },
];

/**
 * Mock Data: 답변 성공률
 */
const ANSWER_SUCCESS_DATA = [
    { name: '성공', value: 92, fill: '#3B82F6' },
    { name: '실패/미응답', value: 8, fill: '#E2E8F0' },
];

/**
 * AI 사용량 차트 (Bar Chart)
 */
export function AiUsageChart() {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <HiOutlineCpuChip className="w-5 h-5 text-slate-500" />
                <span>AI 질의 응답</span>
                <span className="ml-auto text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    최근 7일
                </span>
            </h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={AI_USAGE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar
                            dataKey="count"
                            name="질의 횟수"
                            fill="#FF6B52"
                            radius={[4, 4, 0, 0]}
                            barSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

/**
 * 디바이스 상태 차트 (Pie Chart)
 */
export function DeviceStatusChart() {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
            <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                <HiOutlineDeviceTablet className="w-5 h-5 text-slate-500" />
                디바이스 상태
            </h3>

            {/* 차트 영역 */}
            <div className="flex-1 min-h-[140px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={DEVICE_STATUS_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
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
                {/* 중앙 텍스트 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-900">45</span>
                    <span className="text-[10px] text-slate-400">Total</span>
                </div>
            </div>

            {/* 범례 영역 */}
            <div className="mt-2 space-y-1.5">
                {DEVICE_STATUS_DATA.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-600 truncate text-xs" title={item.full}>{item.full}</span>
                        </div>
                        <span className="font-bold text-slate-900 ml-2">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * 질문 유형 차트 (Pie Chart)
 */
export function QuestionTypeChart() {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
            <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                <HiOutlineChatBubbleBottomCenterText className="w-5 h-5 text-slate-500" />
                질문 유형
            </h3>

            <div className="flex-1 flex flex-col items-center">
                {/* 차트 */}
                <div className="w-full h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={QUESTION_TYPE_DATA}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
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

                {/* 범례 */}
                <div className="w-full mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
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
        </div>
    );
}

/**
 * 답변 성공률 차트
 */
export function SuccessRateChart() {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <HiOutlineCheckCircle className="w-5 h-5 text-slate-500" />
                답변 성공률
            </h3>

            <div className="flex-1 flex items-center gap-4">
                {/* 차트 부분 */}
                <div className="w-24 h-24 relative flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={ANSWER_SUCCESS_DATA}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={45}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                            >
                                {ANSWER_SUCCESS_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">92%</span>
                    </div>
                </div>

                {/* 텍스트 설명 부분 */}
                <div className="flex-1 min-w-0">
                    <div className="mb-2">
                        <p className="text-xs text-slate-500">성공</p>
                        <p className="text-lg font-bold text-slate-900">1,140건</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">실패/미응답</p>
                        <p className="text-sm font-semibold text-slate-400">100건</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
