'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
    HiOutlineMap,
    HiOutlineBuildingLibrary,
    HiChevronDown,
    HiCheck
} from 'react-icons/hi2';

// Dynamic Import for Leaflet (SSR False)
const AdminMap = dynamic(() => import('./AdminMap'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="text-sm font-medium">지도를 불러오는 중입니다...</p>
        </div>
    )
});

// Mock Data (Sites & Kiosks & Zones)
interface SiteOption {
    id: number;
    name: string;
    center: [number, number];
    zoom: number;
}

const SITES: SiteOption[] = [
    { id: 1, name: '에버랜드 (Everland)', center: [37.2939, 127.2025], zoom: 15 },
    { id: 2, name: '경복궁 (Gyeongbokgung)', center: [37.5796, 126.9770], zoom: 16 },
    { id: 3, name: '롯데월드 (Lotte World)', center: [37.5111, 127.0982], zoom: 16 },
];

interface KioskLocation {
    id: string;
    name: string;
    lat: number;
    lng: number;
    status: 'online' | 'warning' | 'offline';
    zone: string;
}

interface ZoneInfo {
    id: string;
    name: string;
    center: [number, number];
    paths: [number, number][];
    color: string;
}

const MOCK_KIOSKS: Record<number, KioskLocation[]> = {
    1: [ // 에버랜드
        { id: 'K-01', name: '정문 매표소', lat: 37.2939, lng: 127.2025, status: 'online', zone: '글로벌페어' },
        { id: 'K-02', name: '사파리 월드', lat: 37.2925, lng: 127.2045, status: 'warning', zone: '주토피아' },
        { id: 'K-03', name: 'T익스프레스', lat: 37.2915, lng: 127.2015, status: 'online', zone: '유러피언어드벤처' },
    ],
};

const MOCK_ZONES: Record<number, ZoneInfo[]> = {
    1: [ // 에버랜드 Zones
        {
            id: 'Z-01', name: '글로벌페어',
            center: [37.2945, 127.2025],
            paths: [
                [37.2950, 127.2010], [37.2950, 127.2040], [37.2930, 127.2040], [37.2930, 127.2010]
            ],
            color: '#3b82f6'
        },
        {
            id: 'Z-02', name: '주토피아',
            center: [37.2925, 127.2055],
            paths: [
                [37.2935, 127.2045], [37.2935, 127.2070], [37.2915, 127.2070], [37.2915, 127.2045]
            ],
            color: '#10b981'
        },
        {
            id: 'Z-03', name: '유러피언',
            center: [37.2910, 127.2015],
            paths: [
                [37.2920, 127.2005], [37.2920, 127.2025], [37.2900, 127.2025], [37.2900, 127.2005]
            ],
            color: '#a855f7'
        },
    ],
};

export function KioskMap() {
    const [selectedSiteId, setSelectedSiteId] = useState<number>(1);
    const [zoom, setZoom] = useState(15);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentSite = SITES.find(s => s.id === selectedSiteId) || SITES[0];
    const markers = MOCK_KIOSKS[selectedSiteId] || [];
    const zones = MOCK_ZONES[selectedSiteId] || [];

    // 드롭다운 외부 클릭 감지
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

    const handleSiteSelect = (site: SiteOption) => {
        setSelectedSiteId(site.id);
        setZoom(site.zoom);
        setIsDropdownOpen(false);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
            {/* Header with Site Selector */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 z-10 bg-white relative">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <HiOutlineMap className="w-5 h-5 text-slate-500" />
                        실시간 모니터링
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {currentSite.name} - 총 {markers.length}대 가동 중
                    </p>
                </div>

                {/* Custom Site Selector Dropdown */}
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
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDropdownOpen ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                            <HiOutlineBuildingLibrary className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold min-w-[80px] text-left">{currentSite.name.split(' ')[0]}</span>
                        <HiChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-orange-500' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <div className={`absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top-right
                        ${isDropdownOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}
                    `}>
                        <div className="p-1">
                            {SITES.map((site) => (
                                <button
                                    key={site.id}
                                    onClick={() => handleSiteSelect(site)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors
                                        ${selectedSiteId === site.id
                                            ? 'bg-orange-50 text-orange-700 font-bold'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-orange-600 font-medium'
                                        }
                                    `}
                                >
                                    <span>{site.name}</span>
                                    {selectedSiteId === site.id && <HiCheck className="w-4 h-4 text-orange-600" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative bg-slate-100 min-h-[350px]">
                <AdminMap
                    center={currentSite.center}
                    zoom={zoom}
                    markers={markers}
                    zones={zones}
                />

                {/* Legend Overlay */}
                <div className="absolute bottom-6 left-4 bg-white/90 backdrop-blur-sm px-3 py-2.5 rounded-xl border border-slate-200 shadow-lg text-xs space-y-1.5 z-1000 pointer-events-none select-none">
                    <div className="font-bold text-slate-800 mb-1">Status Legend</div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-green-100" />
                        <span className="text-slate-600">정상 (Online)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-orange-100" />
                        <span className="text-slate-600">점검 (Warning)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-100" />
                        <span className="text-slate-600">장애 (Offline)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
