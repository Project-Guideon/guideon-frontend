'use client';

import { useState } from 'react';
import {
    HiOutlineMinus,
    HiOutlinePlus,
    HiOutlineMap,
    HiOutlineInformationCircle,
    HiOutlineDeviceTablet
} from 'react-icons/hi2';

interface KioskLocation {
    id: string;
    name: string;
    x: number; // 0-100%
    y: number; // 0-100%
    status: 'online' | 'warning' | 'offline';
    zone: string;
}

const MOCK_LOCATIONS: KioskLocation[] = [
    { id: 'K-01', name: '정문 입구', x: 20, y: 80, status: 'online', zone: 'ZONE-A' },
    { id: 'K-02', name: '매표소 앞', x: 25, y: 75, status: 'online', zone: 'ZONE-A' },
    { id: 'K-03', name: '사파리 대기줄', x: 50, y: 40, status: 'warning', zone: 'ZONE-B' },
    { id: 'K-04', name: '장미원 입구', x: 70, y: 60, status: 'online', zone: 'ZONE-C' },
    { id: 'K-05', name: 'T익스프레스', x: 60, y: 30, status: 'online', zone: 'ZONE-B' },
    { id: 'K-06', name: '주차장 A', x: 10, y: 90, status: 'offline', zone: 'ZONE-D' },
    { id: 'K-07', name: '식당가', x: 40, y: 55, status: 'online', zone: 'ZONE-E' },
];

export function KioskMap() {
    const [zoom, setZoom] = useState(1);
    const [selectedKiosk, setSelectedKiosk] = useState<KioskLocation | null>(null);

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.8));

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-[500px] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <HiOutlineMap className="w-5 h-5 text-slate-500" />
                        실시간 키오스크 분포
                        <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            에버랜드 전체
                        </span>
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">현재 45대 운영 중 • 2대 오프라인</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleZoomOut} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors">
                        <HiOutlineMinus className="w-5 h-5" />
                    </button>
                    <button onClick={handleZoomIn} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors">
                        <HiOutlinePlus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 relative bg-slate-50 overflow-hidden group cursor-grab active:cursor-grabbing">
                {/* Mock Map Background (Grid Pattern) */}
                <div
                    className="absolute inset-0 transition-transform duration-300 origin-center"
                    style={{
                        transform: `scale(${zoom})`,
                        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}
                >
                    {/* 구역 영역 (Mock Zones) */}
                    <div className="absolute top-[20%] left-[40%] w-[30%] h-[30%] bg-blue-100/50 rounded-full border-2 border-blue-200 flex items-center justify-center text-blue-400 font-bold text-sm select-none">ZONE-B</div>
                    <div className="absolute top-[60%] left-[10%] w-[25%] h-[25%] bg-green-100/50 rounded-full border-2 border-green-200 flex items-center justify-center text-green-400 font-bold text-sm select-none">ZONE-A</div>
                    <div className="absolute top-[50%] left-[60%] w-[20%] h-[20%] bg-purple-100/50 rounded-full border-2 border-purple-200 flex items-center justify-center text-purple-400 font-bold text-sm select-none">ZONE-C</div>

                    {/* Kiosk Markers */}
                    {MOCK_LOCATIONS.map((kiosk) => (
                        <button
                            key={kiosk.id}
                            className={`
                                absolute w-4 h-4 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-150
                                ${kiosk.status === 'online' ? 'bg-[#2ECCB7] shadow-[#2ECCB7]/30' : ''}
                                ${kiosk.status === 'warning' ? 'bg-[#FF9F43] shadow-[#FF9F43]/30' : ''}
                                ${kiosk.status === 'offline' ? 'bg-[#FF5252] shadow-[#FF5252]/30' : ''}
                                ${selectedKiosk?.id === kiosk.id ? 'ring-4 ring-blue-500/20 scale-125 z-10' : 'z-0'}
                            `}
                            style={{ left: `${kiosk.x}%`, top: `${kiosk.y}%` }}
                            onClick={() => setSelectedKiosk(kiosk)}
                            onMouseEnter={() => setSelectedKiosk(kiosk)}
                            aria-label={`${kiosk.name} - ${kiosk.status}`}
                        >
                            <span className="sr-only">{kiosk.name}</span>
                        </button>
                    ))}
                </div>

                {/* Legend (범례) */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-slate-100 shadow-sm text-xs space-y-2 pointer-events-none select-none">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2ECCB7]" />
                        <span className="text-slate-600">정상 (Online)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF9F43]" />
                        <span className="text-slate-600">주의 (Slow)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5252]" />
                        <span className="text-slate-600">오프라인 (Offline)</span>
                    </div>
                </div>

                {/* Tooltip Card */}
                {selectedKiosk && (
                    <div className="absolute bottom-4 left-4 bg-white p-4 rounded-xl shadow-lg border border-slate-100 w-64 animate-fade-in-up z-20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-slate-900 flex items-center gap-1">
                                <HiOutlineDeviceTablet className="w-4 h-4 text-slate-400" />
                                {selectedKiosk.id}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase
                                ${selectedKiosk.status === 'online' ? 'bg-green-100 text-green-600' : ''}
                                ${selectedKiosk.status === 'warning' ? 'bg-orange-100 text-orange-600' : ''}
                                ${selectedKiosk.status === 'offline' ? 'bg-red-100 text-red-600' : ''}
                            `}>
                                {selectedKiosk.status}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">{selectedKiosk.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{selectedKiosk.zone}</p>
                        <div className="mt-3 text-xs text-slate-400 flex justify-between items-center border-t border-slate-50 pt-2">
                            <span>Last Ping: 1m ago</span>
                            <button className="flex items-center text-blue-500 hover:text-blue-600 transition-colors">
                                <HiOutlineInformationCircle className="w-4 h-4 mr-1" />
                                상세보기
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
