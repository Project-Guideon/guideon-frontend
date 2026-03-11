'use client';

import { useState, useRef, useEffect } from 'react';
import { HiOutlineDocumentText, HiOutlineDocumentPlus, HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineMapPin, HiChevronDown, HiCheck } from 'react-icons/hi2';
import { DocumentEntry } from '../../domain/entities/DocumentEntry';
import { DocumentTable } from './DocumentTable';

export function DocumentListView() {
    const [documents, setDocuments] = useState<DocumentEntry[]>([
        { id: '1', fileName: 'everland_guide_v1.pdf', extension: 'pdf', status: 'COMPLETED', size: '2.4MB', uploadedAt: '2024-03-20' },
        { id: '2', fileName: 'safety_manual_jp.docx', extension: 'docx', status: 'PROCESSING', size: '1.1MB', uploadedAt: '2024-03-21' },
        { id: '3', fileName: 'zone_info_data.xlsx', extension: 'xlsx', status: 'FAILED', size: '450KB', uploadedAt: '2024-03-22' },
        { id: '4', fileName: 'new_kiosk_manual.pdf', extension: 'pdf', status: 'PENDING', size: '5.2MB', uploadedAt: '2024-03-23' },
    ]);

    const [selectedSite, setSelectedSite] = useState('전체 장소');
    const [isSiteOpen, setIsSiteOpen] = useState(false);
    const siteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (siteRef.current && !siteRef.current.contains(event.target as Node)) {
                setIsSiteOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const sites = ['전체 장소', '에버랜드', '경복궁', '롯데월드', '제주민속촌']

    const handleDelete = (id: string) => {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        console.log(`삭제 요청: ${id}`);
    };

    const handleDownload = (doc: DocumentEntry) => {
        console.log(`다운로드 시작: ${doc.fileName}`);
    };

    return (
        <div className="flex flex-col">
            {/* 헤더 */}
            <div className="shrink-0 -mt-2">
                <div className="flex items-center gap-2">
                    <h2 className="justify-between mb-3 text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <HiOutlineDocumentText className="w-7 h-7 text-orange-500" />
                        문서 관리
                    </h2>
                    <p className="justify-between mb-3 text-sm text-slate-500 mt-1 font-medium">
                        AI 학습을 위한 도메인 문서를 업로드하고 관리합니다.
                    </p>
                </div>
            </div>

            {/* 검색 부분 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* 검색 영역 */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-sm font-bold text-slate-500 whitespace-nowrap">검색</span>
                        <div className="relative group flex-1 max-w-sm">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center text-slate-500 group-hover:text-orange-600 transition-colors pointer-events-none">
                                <HiOutlineMagnifyingGlass className="w-3.5 h-3.5"/>
                            </div>
                            <input
                                type="text"
                                placeholder="검색어를 입력하세요"
                                className="w-full h-[36px] pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                            />
                        </div>
                    </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:block w-[1px] h-8 bg-slate-200 mx-2" />
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
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                                isSiteOpen ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                                <HiOutlineMapPin className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold flex-1 text-left">{selectedSite}</span>
                            <HiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isSiteOpen ? 'rotate-180 text-orange-500' : ''}`} />
                        </button>

                        <div className={`absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden transition-all origin-top-right
                            ${isSiteOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
                        >
                            <div className="p-1">
                                {sites.map((site) => (
                                    <button
                                        key={site}
                                        onClick={() => {
                                            setSelectedSite(site);
                                            setIsSiteOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                                            ${selectedSite === site 
                                                ? 'bg-orange-50 text-orange-700 font-bold' 
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-orange-600'
                                            }`}
                                    >
                                        <span>{site}</span>
                                        {selectedSite === site && <HiCheck className="w-3.5 h-3.5" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-2 px-5 h-[36px] rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-bold text-slate-500">Total: <span className="text-orange-600">{documents.length}</span></span>
                </div>

                    {/* 액션 버튼 영역 */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block w-[1px] h-8 bg-slate-200 mx-2" />
                        <button className="flex items-center gap-2 px-5 h-[36px] bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-orange-600 transition-all shadow-md active:scale-95 group">
                            <HiOutlineDocumentPlus className="w-4 h-4 group-hover:rotate-15 transition-transform duration-300" />
                            <span>새 문서 업로드</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 문서 목록 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    <DocumentTable 
                        documents={documents} 
                        onDelete={handleDelete} 
                        onDownload={handleDownload}
                    />
                </div>
            </div>
        </div>
    );
}