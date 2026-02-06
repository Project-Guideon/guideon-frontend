'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { HiOutlineDeviceTablet } from 'react-icons/hi2';

// 지도 중심 이동용 컴포넌트
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

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
    center: [number, number]; // 라벨 위치
    paths: [number, number][]; // 다각형 좌표
    color: string;
}

interface AdminMapProps {
    center: [number, number];
    zoom: number;
    markers: KioskLocation[];
    zones?: ZoneInfo[];
}

// 상태별 커스텀 마커 아이콘 생성 함수
const createCustomIcon = (status: 'online' | 'warning' | 'offline') => {
    let colorClass = '';
    let ringClass = '';

    switch (status) {
        case 'online':
            colorClass = 'bg-green-500';
            ringClass = 'bg-green-500/30';
            break;
        case 'warning':
            colorClass = 'bg-orange-500';
            ringClass = 'bg-orange-500/30';
            break;
        case 'offline':
            colorClass = 'bg-red-500';
            ringClass = 'bg-red-500/30';
            break;
    }

    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div class="relative w-6 h-6 flex items-center justify-center">
                <span class="absolute w-full h-full rounded-full ${ringClass} animate-ping"></span>
                <span class="absolute w-full h-full rounded-full ${ringClass} opacity-50"></span>
                <span class="relative w-3 h-3 rounded-full ${colorClass} border-2 border-white shadow-sm"></span>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

// Zone 이름 라벨 아이콘
const createLabelIcon = (name: string) => {
    // Tailwind 색상 클래스를 직접 매핑하기 어려워 hex 컬러를 border/text에 적용
    return L.divIcon({
        className: 'zone-label',
        html: `<div class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/90 border border-slate-300 text-slate-600 shadow-sm whitespace-nowrap transform -translate-x-1/2">${name}</div>`,
        iconSize: [0, 0], // 아이콘 크기 0으로 하고 HTML 내용만 표시
        iconAnchor: [0, 0],
    });
};

export default function AdminMap({ center, zoom, markers, zones = [] }: AdminMapProps) {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%', background: '#f8fafc', zIndex: 0 }}
        >
            <ChangeView center={center} zoom={zoom} />

            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Zone Polygons & Labels */}
            {zones.map((zone) => (
                <div key={zone.id}>
                    <Polygon
                        positions={zone.paths}
                        pathOptions={{
                            color: zone.color,
                            fillColor: zone.color,
                            fillOpacity: 0.15,
                            weight: 2,
                            dashArray: '5, 5'
                        }}
                    />
                    <Marker
                        position={zone.center}
                        icon={createLabelIcon(zone.name)}
                        zIndexOffset={-100}
                    />
                </div>
            ))}

            {/* Kiosk Markers */}
            {markers.map((kiosk) => (
                <Marker
                    key={kiosk.id}
                    position={[kiosk.lat, kiosk.lng]}
                    icon={createCustomIcon(kiosk.status)}
                >
                    <Popup className="custom-popup" closeButton={false} offset={[0, -10]}>
                        <div className="p-1 min-w-[150px]">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-800 flex items-center gap-1">
                                    <HiOutlineDeviceTablet className="w-4 h-4 text-slate-500" />
                                    {kiosk.id}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase
                                    ${kiosk.status === 'online' ? 'bg-green-100 text-green-600' : ''}
                                    ${kiosk.status === 'warning' ? 'bg-orange-100 text-orange-600' : ''}
                                    ${kiosk.status === 'offline' ? 'bg-red-100 text-red-600' : ''}
                                `}>
                                    {kiosk.status}
                                </span>
                            </div>
                            <p className="text-xs font-medium text-slate-600 mb-0.5">{kiosk.name}</p>
                            <p className="text-[10px] text-slate-400">{kiosk.zone}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
