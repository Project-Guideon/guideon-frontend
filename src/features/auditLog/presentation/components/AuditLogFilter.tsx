import { HiOutlineMagnifyingGlass, HiOutlineMapPin, HiCheck, HiChevronDown, HiOutlineClipboardDocumentList, HiChevronUp, HiOutlineBuildingLibrary, HiOutlineCalendar } from 'react-icons/hi2';
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

    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [isSiteOpen, setIsSiteOpen] = useState(false);
    const typeRef = useRef<HTMLDivElement>(null);
    const siteRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (typeRef.current && !typeRef.current.contains(event.target as Node)) setIsTypeOpen(false);
            if (siteRef.current && !siteRef.current.contains(event.target as Node)) setIsSiteOpen(false);
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

                <div className="w-[1px] h-8 bg-slate-200 hidden md:block mx-4" />

                {/* 로그 유형 */}
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-sm font-bold text-slate-500 whitespace-nowrap">
                        로그 유형
                    </span>
                    <div className="relative" ref={typeRef}>
                        <button
                            onClick={() => setIsTypeOpen(!isTypeOpen)}
                            className={`flex items-center gap-2 px-3 py-1.5 bg-white border rounded-xl transition-all duration-200 outline-none h-[36px]
                                ${isTypeOpen
                                    ? 'border-orange-500 ring-4 ring-orange-50 text-slate-800'
                                    : 'border-slate-200 hover:border-orange-400 text-slate-600 hover:bg-orange-50'
                                }
                            `}
                        >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                                isTypeOpen ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                                <HiOutlineClipboardDocumentList className="w-3.5 h-3.5" />
                            </div>

                            <span className="text-xs font-bold min-w-[50px] text-left">
                                {type === '' ? '전체'
                                    : type === 'SYSTEM' ? 'SYSTEM'
                                    : type === 'USER' ? 'USER'
                                    : 'DEVICE'}
                            </span>

                            <HiChevronDown
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                    isTypeOpen ? 'rotate-180 text-orange-500' : ''
                                }`}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        <div className={`absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top-right
                            ${isTypeOpen
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
                                            setIsSiteOpen(false);
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

                    <div className="w-[1px] h-8 bg-slate-200 hidden md:block mx-2" />

                        {/* 장소별 정렬 */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-500 whitespace-nowrap">장소</span>
                            <div className="relative" ref={siteRef}>
                                <button
                                    onClick={() => setIsSiteOpen(!isSiteOpen)}
                                    className={`flex items-center gap-2 px-3 py-1.5 bg-white border rounded-xl transition-all duration-200 outline-none h-[36px]
                                        ${isSiteOpen 
                                            ? 'border-orange-500 ring-4 ring-orange-50 text-slate-800' 
                                            : 'border-slate-200 hover:border-orange-400 text-slate-600 hover:bg-orange-50'}
                                    `}
                                >
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                                        isSiteOpen ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        <HiOutlineMapPin className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs font-bold min-w-[50px] text-left">{sortSite}</span>
                                    <HiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isSiteOpen ? 'rotate-180 text-orange-500' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                <div className={`absolute left-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top-left
                                    ${isSiteOpen 
                                        ? 'opacity-100 scale-100 translate-y-0 visible' 
                                        : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
                                    }
                                `}>
                                    <div className="p-1">
                                        {SITE_OPTIONS.map((site) => (
                                            <button
                                                key={site}
                                                onClick={() => {
                                                    onFilterChange({ sortSite: site });
                                                    setIsSiteOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                                                    ${sortSite === site 
                                                        ? 'bg-orange-50 text-orange-700 font-bold' 
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-orange-600 font-medium'}
                                                `}
                                            >
                                                <span>{site}</span>
                                                {sortSite === site && <HiCheck className="w-3.5 h-3.5 text-orange-600" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    <div className="w-[1px] h-8 bg-slate-200 hidden md:block mx-2" />
                    
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
                    <div className="ml-auto relative group">
                        <button
                            onClick={() => onFilterChange({ sortOrder: sortOrder === 'DESC' ? 'ASC' : 'DESC' })}
                            className={`
                                flex items-center justify-center w-[36px] h-[36px] rounded-xl border transition-all duration-200
                                ${sortOrder === 'DESC' 
                                    ? 'bg-orange-50 border-orange-200 text-orange-600 shadow-sm shadow-orange-100' 
                                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-orange-300 hover:text-orange-500'}
                            `}
                        >
                            {sortOrder === 'ASC' ? (
                                <HiChevronUp className="w-5 h-5 active:scale-90 transition-transform" />
                            ) : (
                                <HiChevronDown className="w-5 h-5 active:scale-90 transition-transform" />
                            )}
                        </button>
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-[60] shadow-xl">
                            {sortOrder === 'DESC' ? '최신순' : '오래된순'}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
