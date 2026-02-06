'use client';

import { HiOutlineClock, HiOutlineExclamationCircle, HiOutlineCheckCircle, HiOutlinePlusCircle } from 'react-icons/hi2';

interface LogItem {
    id: number;
    user: string;
    action: string;
    target: string;
    time: string;
    status: 'success' | 'warning' | 'error';
}

const MOCK_LOGS: LogItem[] = [
    { id: 1, user: 'admin@guideon.com', action: 'CREATE', target: '장소: 북극곰사', time: '방금 전', status: 'success' },
    { id: 2, user: 'system', action: 'UPDATE', target: '디바이스: KIOSK-003', time: '5분 전', status: 'warning' },
    { id: 3, user: 'operator@example.com', action: 'LOGIN', target: '시스템 접속', time: '12분 전', status: 'success' },
    { id: 4, user: 'system', action: 'ERROR', target: '문서 변환 실패: map.pdf', time: '1시간 전', status: 'error' },
    { id: 5, user: 'admin@guideon.com', action: 'UPDATE', target: '구역: 사파리 월드', time: '2시간 전', status: 'success' },
];

export function RecentActivityLog() {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">최근 활동 로그</h3>
                <button className="text-sm text-slate-500 hover:text-slate-800">더보기</button>
            </div>

            <div className="space-y-4">
                {MOCK_LOGS.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                        <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                            ${log.status === 'success' ? 'bg-green-100 text-green-600' : ''}
                            ${log.status === 'warning' ? 'bg-orange-100 text-orange-600' : ''}
                            ${log.status === 'error' ? 'bg-red-100 text-red-600' : ''}
                        `}>
                            {log.status === 'success' && <HiOutlineCheckCircle className="w-5 h-5" />}
                            {log.status === 'warning' && <HiOutlineExclamationCircle className="w-5 h-5" />}
                            {log.status === 'error' && <HiOutlinePlusCircle className="w-5 h-5 rotate-45" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900">
                                {log.action} <span className="font-normal text-slate-600">- {log.target}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    {log.user}
                                </span>
                                <span className="flex items-center text-xs text-slate-400">
                                    <HiOutlineClock className="w-3 h-3 mr-1" />
                                    {log.time}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
