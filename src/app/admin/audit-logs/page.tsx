'use client';

import { HiOutlineClock, HiOutlineExclamationCircle, HiOutlineCheckCircle, HiOutlinePlusCircle, HiOutlineServer } from 'react-icons/hi2';

interface LogItem {
    id: number;
    type: 'SYSTEM' | 'USER' | 'DEVICE';
    site?: string;
    action: string;
    target: string;
    time: string;
    status: 'success' | 'warning' | 'error';
    message: string;
}

const MOCK_PLATFORM_LOGS: LogItem[] = [
    {
        id: 1, type: 'USER', site: '경복궁',
        action: '관광지 생성', target: 'SITE-003', time: '방금 전',
        status: 'success', message: '새로운 관광지 "경복궁"이 생성되었습니다.'
    },
    {
        id: 2, type: 'DEVICE', site: '에버랜드',
        action: '장애 발생', target: 'KIOSK-006', time: '10분 전',
        status: 'warning', message: '네트워크 연결이 지연되고 있습니다.'
    },
    {
        id: 3, type: 'SYSTEM', site: '-',
        action: '시스템 백업', target: 'DB_Daily', time: '1시간 전',
        status: 'success', message: '일일 데이터 백업이 완료되었습니다.'
    },
    {
        id: 4, type: 'SYSTEM', site: '롯데월드',
        action: 'API 오류', target: 'Zone_API', time: '2시간 전',
        status: 'error', message: '구역 정보 동기화에 실패했습니다.'
    },
    {
        id: 5, type: 'USER', site: '에버랜드',
        action: '운영자 초대', target: 'operator@email.com', time: '3시간 전',
        status: 'success', message: '사이트 관리자 초대가 발송되었습니다.'
    },
];

export default function AuditLogsPage() { 
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <HiOutlineServer className="w-5 h-5 text-slate-500" />
                    플랫폼 통합 로그
                </h3>
                <button className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors">
                            전체보기
                        </button>
                    </div>
        
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-0 custom-scrollbar">
                        {MOCK_PLATFORM_LOGS.map((log) => (
                            <div key={log.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                                <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border
                                    ${log.status === 'success' ? 'bg-green-50 border-green-100 text-green-600' : ''}
                                    ${log.status === 'warning' ? 'bg-orange-50 border-orange-100 text-orange-600' : ''}
                                    ${log.status === 'error' ? 'bg-red-50 border-red-100 text-red-600' : ''}
                                `}>
                                    {log.status === 'success' && <HiOutlineCheckCircle className="w-5 h-5" />}
                                    {log.status === 'warning' && <HiOutlineExclamationCircle className="w-5 h-5" />}
                                    {log.status === 'error' && <HiOutlinePlusCircle className="w-5 h-5 rotate-45" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-slate-900 truncate">
                                            {log.action}
                                            {log.site && log.site !== '-' && (
                                                <span className="font-normal text-slate-500 ml-1">@ {log.site}</span>
                                            )}
                                        </p>
                                        <span className="flex items-center text-xs text-slate-400 flex-shrink-0">
                                            <HiOutlineClock className="w-3 h-3 mr-1" />
                                            {log.time}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">{log.message}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border
                                            ${log.type === 'SYSTEM' ? 'bg-slate-100 border-slate-200 text-slate-600' : ''}
                                            ${log.type === 'USER' ? 'bg-blue-50 border-blue-100 text-blue-600' : ''}
                                            ${log.type === 'DEVICE' ? 'bg-purple-50 border-purple-100 text-purple-600' : ''}
                                        `}>
                                            {log.type}
                                        </span>
                                        <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                            {log.target}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
}