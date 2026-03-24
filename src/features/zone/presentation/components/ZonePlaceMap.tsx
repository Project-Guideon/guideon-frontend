'use client';

import { memo, useMemo } from 'react';
import { Map, Polygon, Polyline, CustomOverlayMap, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { HiOutlineDevicePhoneMobile } from 'react-icons/hi2';
import type { Zone } from '@/features/zone/domain/entities/Zone';
import type { Place } from '@/features/place/domain/entities/Place';
import { PLACE_CATEGORY_META } from '@/features/place/domain/entities/Place';
import { PlaceCategoryIcon } from '@/features/place/presentation/components/PlaceCategoryIcon';
import type { Device } from '@/features/device/domain/entities/Device';

const ZONE_COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4'];

export type MapInteractionMode = 'idle' | 'placing' | 'drawing';

interface ZonePlaceMapProps {
    zones: Zone[];
    places: Place[];
    devices: Device[];
    selectedZoneId: number | null;
    selectedPlaceId: number | null;
    selectedDeviceId: string | null;
    onSelectZone: (zoneId: number | null) => void;
    onSelectPlace: (placeId: number | null) => void;
    onSelectDevice: (deviceId: string | null) => void;
    mapCenter: { lat: number; lng: number };
    mapLevel: number;
    /** 현재 인터랙션 모드 */
    mode: MapInteractionMode;
    /** drawing 모드: 사용자가 찍은 폴리곤 꼭짓점들 */
    drawingPoints: { lat: number; lng: number }[];
    /** placing 모드: 사용자가 찍은 장소 위치 */
    placingPosition: { lat: number; lng: number } | null;
    /** 지도 클릭 핸들러 */
    onMapClick: (lat: number, lng: number) => void;
}

function getZoneColor(index: number): string {
    return ZONE_COLORS[index % ZONE_COLORS.length];
}

function ZonePlaceMapInner({
    zones,
    places,
    devices,
    selectedZoneId,
    selectedPlaceId,
    selectedDeviceId,
    onSelectZone,
    onSelectPlace,
    onSelectDevice,
    mapCenter,
    mapLevel,
    mode,
    drawingPoints,
    placingPosition,
    onMapClick,
}: ZonePlaceMapProps) {
    const [loading, error] = useKakaoLoader({
        appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY ?? '',
    });

    const zonePaths = useMemo(
        () => zones.map((zone) => {
            const rawCoords = zone.areaGeojson.coordinates[0];
            const isClosed = rawCoords.length > 2 && rawCoords[0][0] === rawCoords[rawCoords.length - 1][0] && rawCoords[0][1] === rawCoords[rawCoords.length - 1][1];
            const coordsForCenter = isClosed ? rawCoords.slice(0, -1) : rawCoords;
            return {
                zoneId: zone.zoneId,
                path: rawCoords.map(([lng, lat]) => ({ lat, lng })),
                center: {
                    lat: coordsForCenter.reduce((s, c) => s + c[1], 0) / coordsForCenter.length,
                    lng: coordsForCenter.reduce((s, c) => s + c[0], 0) / coordsForCenter.length,
                },
            };
        }),
        [zones],
    );

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

    const cursorStyle = mode !== 'idle' ? 'crosshair' : 'grab';

    return (
        <div className="relative h-full w-full" style={{ cursor: cursorStyle }}>
            <Map
                center={mapCenter}
                level={mapLevel}
                style={{ width: '100%', height: '100%' }}
                onClick={(_, mouseEvent) => {
                    if (mode !== 'idle') {
                        const latLng = mouseEvent.latLng;
                        onMapClick(latLng.getLat(), latLng.getLng());
                    } else {
                        onSelectZone(null);
                        onSelectPlace(null);
                        onSelectDevice(null);
                    }
                }}
            >
                {/* Zone 폴리곤 */}
                {zones.map((zone, index) => {
                    const isSelected = selectedZoneId === zone.zoneId;
                    const color = getZoneColor(index);
                    const pathData = zonePaths[index];

                    return (
                        <div key={`zone-${zone.zoneId}`}>
                            <Polygon
                                path={pathData.path}
                                strokeWeight={isSelected ? 3 : 2}
                                strokeColor={color}
                                strokeOpacity={isSelected ? 1 : 0.7}
                                strokeStyle={zone.zoneType === 'SUB' ? 'shortdash' : 'solid'}
                                fillColor={color}
                                fillOpacity={isSelected ? 0.3 : 0.12}
                                onClick={() => mode === 'idle' && onSelectZone(zone.zoneId)}
                            />
                            <CustomOverlayMap position={pathData.center} zIndex={-1}>
                                <div
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none select-none transition-all
                                        ${isSelected ? 'bg-white border-2 text-slate-800 scale-110' : 'bg-white/80 border border-slate-300 text-slate-500'}`}
                                    style={{ borderColor: isSelected ? color : undefined }}
                                >
                                    {zone.zoneType === 'SUB' && '└ '}{zone.name}
                                </div>
                            </CustomOverlayMap>
                        </div>
                    );
                })}

                {/* Place 마커 */}
                {places.map((place) => {
                    const isSelected = selectedPlaceId === place.placeId;
                    const meta = PLACE_CATEGORY_META[place.category];

                    return (
                        <div key={`place-${place.placeId}`}>
                            <CustomOverlayMap
                                position={{ lat: place.latitude, lng: place.longitude }}
                                zIndex={isSelected ? 20 : 2}
                            >
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        if (mode === 'idle') onSelectPlace(isSelected ? null : place.placeId);
                                    }}
                                    className={`flex items-center justify-center w-9 h-9 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all duration-200 hover:scale-110
                                        ${isSelected ? 'scale-125 ring-4 ring-white/50' : ''}
                                        ${!place.isActive ? 'opacity-50 grayscale' : ''}`}
                                    style={{ backgroundColor: meta.color }}
                                    aria-label={`${place.name} (${meta.label})`}
                                >
                                    <PlaceCategoryIcon category={place.category} size="sm" withBackground={false} className="text-white" />
                                </button>
                            </CustomOverlayMap>

                            {isSelected && mode === 'idle' && (
                                <CustomOverlayMap
                                    position={{ lat: place.latitude, lng: place.longitude }}
                                    yAnchor={1.6}
                                    zIndex={30}
                                >
                                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-3 min-w-[180px] max-w-[220px]">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <PlaceCategoryIcon category={place.category} size="md" color={meta.color} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{place.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{meta.label}</p>
                                            </div>
                                        </div>
                                        {place.description && (
                                            <p className="text-xs text-slate-500 mb-1.5 line-clamp-2">{place.description}</p>
                                        )}
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className={`px-1.5 py-0.5 rounded font-bold ${place.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {place.isActive ? '활성' : '비활성'}
                                            </span>
                                            <span className="text-slate-400">
                                                {place.zoneSource === 'AUTO' ? '자동 배정' : '수동 배정'}
                                            </span>
                                        </div>
                                    </div>
                                </CustomOverlayMap>
                            )}
                        </div>
                    );
                })}

                {/* Device 마커 */}
                {devices.map((device) => {
                    const isSelected = selectedDeviceId === device.deviceId;

                    return (
                        <div key={`device-${device.deviceId}`}>
                            <CustomOverlayMap
                                position={{ lat: device.latitude, lng: device.longitude }}
                                zIndex={isSelected ? 20 : 2}
                            >
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        if (mode === 'idle') onSelectDevice(isSelected ? null : device.deviceId);
                                    }}
                                    className={`flex items-center justify-center w-9 h-9 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 bg-violet-500 text-white
                                        ${isSelected ? 'scale-125 ring-4 ring-white/50' : ''}
                                        ${!device.isActive ? 'opacity-50 grayscale' : ''}`}
                                    aria-label={`디바이스 ${device.locationName}`}
                                >
                                    <HiOutlineDevicePhoneMobile className="w-4 h-4" />
                                </button>
                            </CustomOverlayMap>

                            {isSelected && mode === 'idle' && (
                                <CustomOverlayMap
                                    position={{ lat: device.latitude, lng: device.longitude }}
                                    yAnchor={1.6}
                                    zIndex={30}
                                >
                                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-3 min-w-[200px] max-w-[240px]">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="bg-violet-100 text-violet-600 p-1.5 rounded-lg shrink-0">
                                                <HiOutlineDevicePhoneMobile className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{device.locationName}</p>
                                                <p className="text-[10px] text-slate-400 font-mono font-medium truncate">{device.deviceId}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] mt-2 border-t border-slate-100 pt-2">
                                            <span className={`px-1.5 py-0.5 rounded font-bold ${device.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {device.isActive ? '활성' : '비활성'}
                                            </span>
                                            <span className="text-slate-400">
                                                {device.zoneSource === 'AUTO' ? '자동 배정' : '수동 배정'}
                                            </span>
                                        </div>
                                    </div>
                                </CustomOverlayMap>
                            )}
                        </div>
                    );
                })}

                {/* Drawing 모드: 폴리곤 그리기 */}
                {mode === 'drawing' && drawingPoints.length > 0 && (
                    <>
                        {/* 완성 중인 폴리곤 (3점 이상) */}
                        {drawingPoints.length >= 3 && (
                            <Polygon
                                path={drawingPoints}
                                strokeWeight={3}
                                strokeColor="#f97316"
                                strokeOpacity={0.9}
                                strokeStyle="solid"
                                fillColor="#f97316"
                                fillOpacity={0.15}
                            />
                        )}
                        {/* 2점일 때는 선으로 표시 */}
                        {drawingPoints.length === 2 && (
                            <Polyline
                                path={drawingPoints}
                                strokeWeight={3}
                                strokeColor="#f97316"
                                strokeOpacity={0.9}
                                strokeStyle="solid"
                            />
                        )}
                        {/* 꼭짓점 마커 */}
                        {drawingPoints.map((point, index) => (
                            <CustomOverlayMap key={`vertex-${index}`} position={point} zIndex={10}>
                                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md ${index === 0 ? 'bg-green-500' : 'bg-orange-500'}`} />
                            </CustomOverlayMap>
                        ))}
                    </>
                )}

                {/* Placing 모드: 장소/디바이스 위치 마커 */}
                {mode === 'placing' && placingPosition && (
                    <MapMarker
                        position={placingPosition}
                        image={{
                            src: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                            size: { width: 24, height: 35 },
                        }}
                    />
                )}
            </Map>

        </div>
    );
}

export const ZonePlaceMap = memo(ZonePlaceMapInner);
