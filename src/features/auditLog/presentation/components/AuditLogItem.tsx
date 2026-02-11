import {
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlinePlusCircle,
    HiOutlineClock,
} from 'react-icons/hi2';
import type { AuditLogEntry } from '@/features/auditLog/domain/entities/AuditLogEntry';

/**
 * AuditLogItemProps
 */
interface AuditLogItemProps {
    log: AuditLogEntry;
}

/**
 * 상태별 스타일 매핑
 */
const STATUS_STYLES = {
    success: {
        container: 'bg-green-50 border-green-100 text-green-600',
        icon: HiOutlineCheckCircle,
    },
    warning: {
        container: 'bg-orange-50 border-orange-100 text-orange-600',
        icon: HiOutlineExclamationCircle,
    },
    error: {
        container: 'bg-red-50 border-red-100 text-red-600',
        icon: HiOutlinePlusCircle,
    },
} as const;

/**
 * 타입별 배지 스타일 매핑
 */
const TYPE_BADGE_STYLES = {
    SYSTEM: 'bg-slate-100 border-slate-200 text-slate-600',
    USER: 'bg-blue-50 border-blue-100 text-blue-600',
    DEVICE: 'bg-purple-50 border-purple-100 text-purple-600',
} as const;

/**
 * AuditLogItem — 개별 감사 로그 항목 렌더링
 */
export function AuditLogItem({ log }: AuditLogItemProps) {
    const statusStyle = STATUS_STYLES[log.status];
    const StatusIcon = statusStyle.icon;
    const typeBadgeStyle = TYPE_BADGE_STYLES[log.type];

    return (
        <div className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors group">
            {/* 상태 아이콘 */}
            <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${statusStyle.container}`}>
                <StatusIcon className={`w-5 h-5 ${log.status === 'error' ? 'rotate-45' : ''}`} />
            </div>

            {/* 로그 정보 */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900 truncate">
                        {log.action}
                        {log.site && log.site !== '-' && (
                            <span className="font-normal text-slate-500 ml-1">@ {log.site}</span>
                        )}
                    </p>
                    <span className="flex items-center text-xs text-slate-400 shrink-0">
                        <HiOutlineClock className="w-3 h-3 mr-1" />
                        {log.time}
                    </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-1">{log.message}</p>
                <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${typeBadgeStyle}`}>
                        {log.type}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        {log.target}
                    </span>
                </div>
            </div>
        </div>
    );
}
