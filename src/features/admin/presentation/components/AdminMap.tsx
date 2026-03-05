'use client';

import { useState } from 'react';
import { Map, Polygon, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import { HiOutlineDeviceTablet } from 'react-icons/hi2';

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

interface AdminMapProps {
    center: [number, number];
    zoom: number;
    markers: KioskLocation[];
    zones?: ZoneInfo[];
}

const STATUS_STYLES: Record<KioskLocation['status'], { dotColor: string; ringColor: string; badgeBackground: string; badgeText: string; label: string }> = {
    online: {
        dotColor: 'bg-green-500',
        ringColor: 'bg-green-500/30',
        badgeBackground: 'bg-green-100',
        badgeText: 'text-green-600',
        label: 'ONLINE',
    },
    warning: {
        dotColor: 'bg-orange-500',
        ringColor: 'bg-orange-500/30',
        badgeBackground: 'bg-orange-100',
        badgeText: 'text-orange-600',
        label: 'WARNING',
    },
    offline: {
        dotColor: 'bg-red-500',
        ringColor: 'bg-red-500/30',
        badgeBackground: 'bg-red-100',
        badgeText: 'text-red-600',
        label: 'OFFLINE',
    },
};

/** 카카오맵 zoom level: 숫자가 작을수록 확대, 기존 Leaflet zoom과 반대 방향 */
function convertLeafletZoomToKakaoLevel(leafletZoom: number): number {
    const levelMap: Record<number, number> = {
        13: 7,
        14: 6,
        15: 5,
        16: 4,
        17: 3,
        18: 2,
    };
    return levelMap[leafletZoom] ?? 5;
}

export function AdminMap({ center, zoom, markers, zones = [] }: AdminMapProps) {
    const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

    const [loading, error] = useKakaoLoader({
        appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY ?? '',
    });

    if (loading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                <p className="text-sm font-medium">지도를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 text-red-400 gap-2">
                <p className="text-sm font-medium">지도를 불러오지 못했습니다.</p>
            </div>
        );
    }

    const kakaoLevel = convertLeafletZoomToKakaoLevel(zoom);

    return (
        <Map
            center={{ lat: center[0], lng: center[1] }}
            level={kakaoLevel}
            style={{ width: '100%', height: '100%' }}
        >
            {/* Zone Polygons & Labels */}
            {zones.map((zone) => (
                <div key={zone.id}>
                    <Polygon
                        path={zone.paths.map(([lat, lng]) => ({ lat, lng }))}
                        strokeWeight={2}
                        strokeColor={zone.color}
                        strokeOpacity={0.8}
                        strokeStyle="shortdash"
                        fillColor={zone.color}
                        fillOpacity={0.15}
                    />
                    <CustomOverlayMap
                        position={{ lat: zone.center[0], lng: zone.center[1] }}
                        zIndex={-1}
                    >
                        <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/90 border border-slate-300 text-slate-600 shadow-sm whitespace-nowrap -translate-x-1/2 pointer-events-none select-none">
                            {zone.name}
                        </div>
                    </CustomOverlayMap>
                </div>
            ))}

            {/* Kiosk Markers */}
            {markers.map((kiosk) => {
                const style = STATUS_STYLES[kiosk.status];
                const isSelected = selectedMarkerId === kiosk.id;

                return (
                    <div key={kiosk.id}>
                        {/* Custom marker overlay */}
                        <CustomOverlayMap
                            position={{ lat: kiosk.lat, lng: kiosk.lng }}
                            zIndex={isSelected ? 10 : 1}
                        >
                            <button
                                type="button"
                                className="relative w-6 h-6 flex items-center justify-center cursor-pointer"
                                onClick={() => setSelectedMarkerId(isSelected ? null : kiosk.id)}
                                aria-label={`키오스크 ${kiosk.id} - ${kiosk.status}`}
                            >
                                <span className={`absolute w-full h-full rounded-full ${style.ringColor} animate-ping`} />
                                <span className={`absolute w-full h-full rounded-full ${style.ringColor} opacity-50`} />
                                <span className={`relative w-3 h-3 rounded-full ${style.dotColor} border-2 border-white shadow-sm`} />
                            </button>
                        </CustomOverlayMap>

                        {/* Popup overlay */}
                        {isSelected && (
                            <CustomOverlayMap
                                position={{ lat: kiosk.lat, lng: kiosk.lng }}
                                yAnchor={1.4}
                                zIndex={20}
                            >
                                <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 min-w-[160px]">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-slate-800 flex items-center gap-1 text-sm">
                                            <HiOutlineDeviceTablet className="w-4 h-4 text-slate-500" />
                                            {kiosk.id}
                                        </span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${style.badgeBackground} ${style.badgeText}`}>
                                            {style.label}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-600 mb-0.5">{kiosk.name}</p>
                                    <p className="text-[10px] text-slate-400">{kiosk.zone}</p>
                                </div>
                            </CustomOverlayMap>
                        )}
                    </div>
                );
            })}
        </Map>
    );
}
