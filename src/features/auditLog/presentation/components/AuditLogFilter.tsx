import { HiChevronDown, HiOutlineBuildingLibrary, HiOutlineCalendar } from 'react-icons/hi2';
import type { AuditLogType } from '@/features/auditLog/domain/entities/AuditLogEntry';
import { useRef, useEffect, useState } from 'react';

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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
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
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-xl transition-all duration-200 outline-none
                            ${isDropdownOpen
                                ? 'border-orange-500 ring-4 ring-orange-50 text-slate-800'
                                : 'border-slate-200 hover:border-orange-400 text-slate-600 hover:bg-orange-50'
                            }
                        `}
                    >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                            isDropdownOpen ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                            <HiOutlineBuildingLibrary className="w-4 h-4" />
                        </div>

                        <span className="text-sm font-bold min-w-[80px] text-left">
                            {type === '' ? '전체'
                                : type === 'SYSTEM' ? 'SYSTEM'
                                : type === 'USER' ? 'USER'
                                : 'DEVICE'}
                        </span>

                        <HiChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                isDropdownOpen ? 'rotate-180 text-orange-500' : ''
                            }`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    <div className={`absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top-right
                        ${isDropdownOpen
                            ? 'opacity-100 scale-100 translate-y-0 visible'
                            : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
                        }
                    `}>
                        <div className="p-1">
                            {(['', 'SYSTEM', 'USER', 'DEVICE'] as (AuditLogType | '')[]).map((item) => (
                                <button
                                    key={item || 'ALL'}
                                    onClick={() => {
                                        onFilterChange({ type: item });
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors
                                        ${type === item
                                            ? 'bg-orange-50 text-orange-700 font-bold'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-orange-600 font-medium'
                                        }
                                    `}
                                >
                                    <span>{item === '' ? '전체' : item}</span>
                                    {type === item && (
                                        <HiChevronDown className="w-4 h-4 text-orange-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
