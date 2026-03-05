import { HiOutlineMagnifyingGlass, HiChevronDown, HiChevronUp, HiOutlineBuildingLibrary, HiOutlineCalendar } from 'react-icons/hi2';
import type { AuditLogType, AuditLogSortOrder } from '@/features/auditLog/domain/entities/AuditLogEntry';
import { useRef, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './datepicker-custom.css';

/**
 * AuditLogFilterProps
 */
interface AuditLogFilterProps {
    startDate: string;
    endDate: string;
    type: AuditLogType | '';
    searchTerm: string;
    sortSite: string;
    sortOrder: AuditLogSortOrder;
    onFilterChange: (updates: { startDate?: string; endDate?: string; type?: AuditLogType | ''; searchTerm?: string; sortSite?: string; sortOrder?: AuditLogSortOrder;}) => void;
}

/**
 * AuditLogFilter — 감사 로그 필터 UI (날짜 범위, 유형 선택)
 */
export function AuditLogFilter({ startDate, endDate, type, searchTerm, sortSite, sortOrder, onFilterChange }: AuditLogFilterProps) {
    // 나중에는 데이터 들고와서 적용할 예정
    const SITE_OPTIONS = ['전체', '에버랜드', '경복궁', '롯데월드'];

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

    const CustomDateButton = ({ value, onClick, label }: { value?: string, onClick?: () => void, label: string }) => (
        <div className="flex  items-center gap-2">
            <span className="text-sm font-bold text-slate-500 whitespace-nowrap">
                {label}
            </span>
            <button
                type="button"
                onClick={onClick}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 outline-none h-[36px] min-w-[140px]"
            >
                <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                    <HiOutlineCalendar className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700 flex-1 text-left">
                    {value || "날짜 선택"}
                </span>
                <HiChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
        </div>
    );

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-3">
            <div className="flex flex-wrap items-center gap-2">
                 {/* 시작 날짜 */}
                <DatePicker
                    selected={startDate ? new Date(startDate) : null}
                    onChange={(date: Date | null) => onFilterChange({ startDate: date ? date.toISOString().split('T')[0] : '' })}customInput={<CustomDateButton label="시작 날짜" />}
                    dateFormat="yyyy-MM-dd"
                />

                <span className="text-base text-slate-500 font-medium">~</span>

                {/* 종료 날짜 */}
                <DatePicker
                    selected={endDate ? new Date(endDate) : null}
                    onChange={(date: Date | null) => onFilterChange({ endDate: date ? date.toISOString().split('T')[0] : '' })}customInput={<CustomDateButton label="종료 날짜" />}
                    dateFormat="yyyy-MM-dd"
                    minDate={startDate ? new Date(startDate) : undefined}
                />

                <div className="w-[1px] h-8 bg-slate-200 hidden md:block mx-6" />

                {/* 로그 유형 */}
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-sm font-bold text-slate-500 whitespace-nowrap">
                        로그 유형
                    </span>
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`flex items-center gap-2 px-3 py-1.5 bg-white border rounded-xl transition-all duration-200 outline-none h-[36px]
                                ${isDropdownOpen
                                    ? 'border-orange-500 ring-4 ring-orange-50 text-slate-800'
                                    : 'border-slate-200 hover:border-orange-400 text-slate-600 hover:bg-orange-50'
                                }
                            `}
                        >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                                isDropdownOpen ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                                <HiOutlineBuildingLibrary className="w-3.5 h-3.5" />
                            </div>

                            <span className="text-xs font-bold min-w-[60px] text-left">
                                {type === '' ? '전체'
                                    : type === 'SYSTEM' ? 'SYSTEM'
                                    : type === 'USER' ? 'USER'
                                    : 'DEVICE'}
                            </span>

                            <HiChevronDown
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
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
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                                            ${type === item
                                                ? 'bg-orange-50 text-orange-700 font-bold'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-orange-600 font-medium'
                                            }
                                        `}
                                    >
                                        <span>{item === '' ? '전체' : item}</span>
                                        {type === item && (
                                            <HiChevronDown className="w-3.5 h-3.5 text-orange-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="w-[1px] h-8 bg-slate-200 hidden md:block mx-6" />

                        {/* 장소별 정렬 */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-500 whitespace-nowrap">장소</span>
                            <select
                                value={sortSite}
                                onChange={(e) => onFilterChange({ sortSite: e.target.value })}
                                className="h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-orange-500 transition-all"
                            >
                                {SITE_OPTIONS.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>

                    <div className="w-[1px] h-8 bg-slate-200 hidden md:block mx-4" />
                    
                    {/* 검색창 */}
                    <div className="flex items-center gap-4 ">
                        <span className="text-sm font-bold text-slate-500 whitespace-nowrap">검색</span>
                        <div className="relative group w-48">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center text-slate-500 group-hover:text-orange-600 transition-colors pointer-events-none">
                                <HiOutlineMagnifyingGlass className="w-3.5 h-3.5" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
                                placeholder="검색어를 입력하세요"
                                className="w-full h-[36px] pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium outline-none transition-all duration-200 hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                            />
                        </div>
                    </div>

                    {/* 시간 순 토글 */}
                    <button
                        onClick={() => onFilterChange({ sortOrder: sortOrder === 'DESC' ? 'ASC' : 'DESC' })}
                        className="flex items-center justify-center w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all group ml-auto"
                        title={sortOrder === 'DESC' ? '최신순 (과거순으로 변경)' : '과거순 (최신순으로 변경)'}
                    >
                        {sortOrder === 'ASC' ? (
                            <HiChevronUp className="w-5 h-5 text-orange-600 animate-bounce-short" />
                        ) : (
                            <HiChevronDown className="w-5 h-5 text-orange-600 animate-bounce-short" />
                        )}
                    </button>
                    
                </div>
            </div>
        </div>
    );
}
