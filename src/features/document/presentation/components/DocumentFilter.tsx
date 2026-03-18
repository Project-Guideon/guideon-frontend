'use client';

import { useRef, useEffect, useState } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineDocumentPlus, HiOutlineMapPin, HiChevronDown, HiCheck } from 'react-icons/hi2';

interface DocumentFilterProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    selectedSite: string;
    setSelectedSite: (site: string) => void;
    selectedExtension: string;
    setSelectedExtension: (extension: string) => void;
    totalCount: number;
    onUploadClick: () => void;
}

export function DocumentFilter({ searchQuery, setSearchQuery, selectedSite, setSelectedSite, selectedExtension, setSelectedExtension, totalCount, onUploadClick }: DocumentFilterProps) {
    const [isSiteOpen, setIsSiteOpen] = useState(false);
    const [isExtensionOpen, setIsExtensionOpen] = useState(false);
    const siteRef = useRef<HTMLDivElement>(null);
    const extensionRef = useRef<HTMLDivElement>(null);
    const sites = ['전체 장소', '에버랜드', '경복궁', '롯데월드', '제주민속촌'];
    const extensions = ['전체 파일', 'pdf', 'xlsx'];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (siteRef.current && !siteRef.current.contains(event.target as Node)) {
                setIsSiteOpen(false);
            }
            if (extensionRef.current && !extensionRef.current.contains(event.target as Node)) {
                setIsExtensionOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        // 검색 부분 
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* 검색 영역 */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm font-bold text-slate-500 whitespace-nowrap">검색</span>
                    <div className="relative group flex-1 max-w-sm">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center text-slate-500 group-hover:text-orange-600 transition-colors pointer-events-none">
                            <HiOutlineMagnifyingGlass className="w-3.5 h-3.5" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="검색어를 입력하세요"
                            className="w-full h-[36px] pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {/* 파일 종류 필터 */}
                    <div className="hidden sm:block w-[1px] h-8 bg-slate-200 mx-2" />
                    <span className="text-sm font-bold text-slate-500 whitespace-nowrap">파일 종류</span>
                    <div className="relative" ref={extensionRef}>
                        <button
                            onClick={() => setIsExtensionOpen(!isExtensionOpen)}
                            className={`flex items-center gap-2 px-3 py-1.5 bg-white border rounded-xl transition-all duration-200 outline-none h-[36px] min-w-[130px]
                                ${isExtensionOpen
                                    ? 'border-orange-500 ring-4 ring-orange-50 text-slate-800'
                                    : 'border-slate-200 hover:border-orange-400 text-slate-600 hover:bg-orange-50'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${isExtensionOpen ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                <HiOutlineDocumentPlus className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold flex-1 text-left uppercase">
                                {selectedExtension === '전체 파일' ? selectedExtension : selectedExtension}
                            </span>
                            <HiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExtensionOpen ? 'rotate-180 text-orange-500' : ''}`} />
                        </button>

                        {isExtensionOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 p-1">
                                {extensions.map((ext) => (
                                    <button
                                        key={ext}
                                        onClick={() => {
                                            setSelectedExtension(ext);
                                            setIsExtensionOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${selectedExtension === ext ? 'bg-orange-50 text-orange-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className={ext !== '전체 파일' ? 'uppercase' : ''}>{ext}</span>
                                        {selectedExtension === ext && <HiCheck className="w-3.5 h-3.5" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="hidden sm:block w-[1px] h-8 bg-slate-200 mx-2" />

                    {/* 장소 필터 */}
                    <span className="text-sm font-bold text-slate-500 whitespace-nowrap">장소</span>
                    <div className="relative" ref={siteRef}>
                        <button
                            onClick={() => setIsSiteOpen(!isSiteOpen)}
                            className={`flex items-center gap-2 px-3 py-1.5 bg-white border rounded-xl transition-all duration-200 outline-none h-[36px] min-w-[130px]
                                ${isSiteOpen
                                    ? 'border-orange-500 ring-4 ring-orange-50 text-slate-800'
                                    : 'border-slate-200 hover:border-orange-400 text-slate-600 hover:bg-orange-50'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${isSiteOpen ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                <HiOutlineMapPin className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold flex-1 text-left">{selectedSite}</span>
                            <HiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isSiteOpen ? 'rotate-180 text-orange-500' : ''}`} />
                        </button>

                        {isSiteOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 p-1">
                                {sites.map((site) => (
                                    <button
                                        key={site}
                                        onClick={() => {
                                            setSelectedSite(site);
                                            setIsSiteOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${selectedSite === site ? 'bg-orange-50 text-orange-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {site}
                                        {selectedSite === site && <HiCheck className="w-3.5 h-3.5" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-2 px-5 h-[36px] rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-bold text-slate-500">
                        Total: <span className="text-orange-600">{totalCount}</span>
                    </span>
                </div>

                {/* 액션 버튼 영역 */}
                <button onClick={onUploadClick} className="flex items-center gap-2 px-5 h-[36px] bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-orange-600 transition-all shadow-md active:scale-95 group">
                    <HiOutlineDocumentPlus className="w-4 h-4 group-hover:rotate-15 transition-transform duration-300" />
                    <span>새 문서 업로드</span>
                </button>
            </div>
        </div>
    );
}