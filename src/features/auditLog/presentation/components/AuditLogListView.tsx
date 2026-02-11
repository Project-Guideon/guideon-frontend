'use client';

import { HiOutlineServer } from 'react-icons/hi2';
import { useAuditLogs } from '@/features/auditLog/application/hooks/useAuditLogs';
import { AuditLogFilter } from './AuditLogFilter';
import { AuditLogItem } from './AuditLogItem';

/**
 * AuditLogListView — 감사 로그 전체 뷰
 *
 * 헤더, 필터, 로그 리스트를 조합하는 프레젠테이션 컴포넌트
 */
export function AuditLogListView() {
    const { logs, filter, updateFilter } = useAuditLogs();

    return (
        <div className="flex flex-col">
            {/* 페이지 헤더 */}
            <div className="shrink-0">
                <div className="flex items-center gap-2">
                    <h2 className="justify-between mb-3 text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <HiOutlineServer className="w-7 h-7 text-orange-500" />
                        플랫폼 통합 로그
                    </h2>
                    <p className="justify-between mb-3 text-sm text-slate-500 mt-1 font-medium">
                        시스템 전반의 변경 사항과 작업 내역을 모니터링합니다.
                    </p>
                </div>
            </div>

            {/* 필터 */}
            <AuditLogFilter
                startDate={filter.startDate}
                endDate={filter.endDate}
                type={filter.type}
                onFilterChange={updateFilter}
            />

            {/* 로그 리스트 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-0 custom-scrollbar">
                    {logs.map((log) => (
                        <AuditLogItem key={log.id} log={log} />
                    ))}
                </div>
            </div>
        </div>
    );
}
