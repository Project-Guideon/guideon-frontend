'use client';

import { ReactNode } from 'react';

interface StatCardProps {
    icon: ReactNode;
    label: string;
    value: string | number;
    subValue?: string; // e.g. "전일 대비 +10"
    isPositive?: boolean; // 긍정적 변화인가?
    color: 'blue' | 'green' | 'purple' | 'orange';
}

/**
 * StatCard
 * - 단순하고 명확한 숫자 지표 표시
 * - 복잡한 트렌드 그래프보다는 "전일 대비 증감" 등 텍스트 위주
 */
export function StatCard({ icon, label, value, subValue, isPositive, color }: StatCardProps) {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorStyles[color]}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">{value}</p>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    {subValue && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {isPositive ? '▲' : '▼'} {subValue}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
