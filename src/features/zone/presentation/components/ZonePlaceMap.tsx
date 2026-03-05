'use client';

import { Map, Polygon, CustomOverlayMap, useKakaoLoader } from 'react-kakao-maps-sdk';
import type { Zone } from '@/features/zone/domain/entities/Zone';
import type { Place } from '@/features/place/domain/entities/Place';
import { PLACE_CATEGORY_META } from '@/features/place/domain/entities/Place';

/** Zone 색상 팔레트 */
const ZONE_COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4'];

interface ZonePlaceMapProps {
    zones: Zone[];
    places: Place[];
    selectedZoneId: number | null;
    selectedPlaceId: number | null;
    onSelectZone: (zoneId: number | null) => void;
    onSelectPlace: (placeId: number | null) => void;
    mapCenter: { lat: number; lng: number };
    mapLevel: number;
}

function getZoneColor(index: number): string {
    return ZONE_COLORS[index % ZONE_COLORS.length];
}

export function ZonePlaceMap({
    zones,
    places,
    selectedZoneId,
    selectedPlaceId,
    onSelectZone,
    onSelectPlace,
    mapCenter,
    mapLevel,
}: ZonePlaceMapProps) {
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
                <p className="text-xs text-slate-400">카카오 API 키를 확인해주세요.</p>
            </div>
        );
    }

    return (
        <Map
            center={mapCenter}
            level={mapLevel}
            style={{ width: '100%', height: '100%' }}
            onClick={() => {
                onSelectZone(null);
                onSelectPlace(null);
            }}
        >
            {/* Zone 폴리곤 */}
            {zones.map((zone, index) => {
                const isSelected = selectedZoneId === zone.zoneId;
                const color = getZoneColor(index);

                return (
                    <div key={`zone-${zone.zoneId}`}>
                        <Polygon
                            path={zone.areaGeojson.coordinates[0].map(([lng, lat]) => ({ lat, lng }))}
                            strokeWeight={isSelected ? 3 : 2}
                            strokeColor={color}
                            strokeOpacity={isSelected ? 1 : 0.7}
                            strokeStyle={zone.zoneType === 'SUB' ? 'shortdash' : 'solid'}
                            fillColor={color}
                            fillOpacity={isSelected ? 0.3 : 0.12}
                            onClick={() => onSelectZone(zone.zoneId)}
                        />
                        {/* Zone 라벨 */}
                        <CustomOverlayMap
                            position={{
                                lat: zone.areaGeojson.coordinates[0].reduce((sum, coord) => sum + coord[1], 0) / zone.areaGeojson.coordinates[0].length,
                                lng: zone.areaGeojson.coordinates[0].reduce((sum, coord) => sum + coord[0], 0) / zone.areaGeojson.coordinates[0].length,
                            }}
                            zIndex={-1}
                        >
                            <div
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none select-none transition-all
                                    ${isSelected
                                        ? 'bg-white border-2 text-slate-800 scale-110'
                                        : 'bg-white/80 border border-slate-300 text-slate-500'
                                    }`}
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
                                    onSelectPlace(isSelected ? null : place.placeId);
                                }}
                                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all duration-200 hover:scale-110
                                    ${isSelected ? 'scale-125 ring-4 ring-white/50' : ''}
                                    ${!place.isActive ? 'opacity-50 grayscale' : ''}
                                `}
                                style={{ backgroundColor: meta.color }}
                                aria-label={`${place.name} (${meta.label})`}
                            >
                                <span className="text-sm leading-none">{meta.emoji}</span>
                            </button>
                        </CustomOverlayMap>

                        {/* 선택된 Place 팝업 */}
                        {isSelected && (
                            <CustomOverlayMap
                                position={{ lat: place.latitude, lng: place.longitude }}
                                yAnchor={1.6}
                                zIndex={30}
                            >
                                <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-3 min-w-[180px] max-w-[220px]">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span
                                            className="flex items-center justify-center w-6 h-6 rounded-lg text-white text-xs"
                                            style={{ backgroundColor: meta.color }}
                                        >
                                            {meta.emoji}
                                        </span>
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
        </Map>
    );
}
