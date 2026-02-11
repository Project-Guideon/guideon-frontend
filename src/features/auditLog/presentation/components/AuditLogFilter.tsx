import { HiOutlineCalendar } from 'react-icons/hi2';
import type { AuditLogType } from '@/features/auditLog/domain/entities/AuditLogEntry';

/**
 * AuditLogFilterProps
 */
interface AuditLogFilterProps {
    startDate: string;
    endDate: string;
    type: AuditLogType | '';
    onFilterChange: (updates: { startDate?: string; endDate?: string; type?: AuditLogType | '' }) => void;
}

/**
 * AuditLogFilter — 감사 로그 필터 UI (날짜 범위, 유형 선택)
 */
export function AuditLogFilter({ startDate, endDate, type, onFilterChange }: AuditLogFilterProps) {
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-3">
            <div className="flex items-center gap-2">
                {/* 시작 날짜 */}
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                        <HiOutlineCalendar className="w-3 h-3" />
                        시작 날짜
                    </span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(event) => onFilterChange({ startDate: event.target.value })}
                        className="h-9 px-3 text-xs text-slate-700
                    border border-slate-200 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                </div>

                {/* 구분자 */}
                <div>
                    <span className="flex items-center gap-1 text-s text-slate-500">~</span>
                </div>

                {/* 종료 날짜 */}
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                        <HiOutlineCalendar className="w-3 h-3" />
                        종료 날짜
                    </span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(event) => onFilterChange({ endDate: event.target.value })}
                        className="h-9 px-3 text-xs text-slate-700
                    border border-slate-200 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                </div>

                {/* 로그 유형 */}
                <span className="flex items-center gap-1 text-xs font-bold text-slate-500 whitespace-nowrap">
                    로그 유형
                </span>
                <select
                    value={type}
                    onChange={(event) => onFilterChange({ type: event.target.value as AuditLogType | '' })}
                    className="h-9 px-3 text-xs text-slate-700 bg-white
                  border border-slate-200 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-orange-100"
                >
                    <option value="">전체</option>
                    <option value="SYSTEM">SYSTEM</option>
                    <option value="USER">USER</option>
                    <option value="DEVICE">DEVICE</option>
                </select>
            </div>
        </div>
    );
}
