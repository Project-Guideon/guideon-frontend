'use client';

import { HiOutlineMapPin, HiOutlineMap, HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
import type { Zone } from '@/features/zone/domain/entities/Zone';
import type { Place } from '@/features/place/domain/entities/Place';
import { PLACE_CATEGORY_META } from '@/features/place/domain/entities/Place';

type TabType = 'zones' | 'places';

interface ZonePlaceSidePanelProps {
    activeTab: TabType;
    onChangeTab: (tab: TabType) => void;
    zones: Zone[];
    places: Place[];
    selectedZoneId: number | null;
    selectedPlaceId: number | null;
    onSelectZone: (zoneId: number | null) => void;
    onSelectPlace: (placeId: number | null) => void;
    onEditZone: (zone: Zone) => void;
    onDeleteZone: (zone: Zone) => void;
    onEditPlace: (place: Place) => void;
    onDeletePlace: (place: Place) => void;
}

/** Zone 트리 구조 렌더링 */
function ZoneTreeItem({
    zone,
    subZones,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
}: {
    zone: Zone;
    subZones: Zone[];
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div>
            <button
                type="button"
                onClick={onSelect}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 group
                    ${isSelected
                        ? 'bg-orange-50 border border-orange-200 text-orange-700'
                        : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                    }`}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${zone.zoneType === 'INNER' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                    <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{zone.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{zone.code} · {zone.zoneType}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                        type="button"
                        onClick={(event) => { event.stopPropagation(); onEdit(); }}
                        className="p-1 rounded-lg hover:bg-orange-100 text-slate-400 hover:text-orange-600 transition-colors"
                        aria-label={`${zone.name} 수정`}
                    >
                        <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={(event) => { event.stopPropagation(); onDelete(); }}
                        className="p-1 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                        aria-label={`${zone.name} 삭제`}
                    >
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                    </button>
                </div>
            </button>
            {/* SUB zones */}
            {subZones.length > 0 && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 pl-2">
                    {subZones.map((sub) => (
                        <button
                            key={sub.zoneId}
                            type="button"
                            onClick={() => onSelect()}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all duration-200 group text-sm
                                ${sub.zoneId === (isSelected ? zone.zoneId : null)
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'hover:bg-slate-50 text-slate-600'
                                }`}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                <span className="font-medium truncate">{sub.name}</span>
                                <span className="text-[10px] text-slate-400 shrink-0">{sub.code}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/** Place 리스트 아이템 */
function PlaceListItem({
    place,
    zoneName,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
}: {
    place: Place;
    zoneName: string;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const meta = PLACE_CATEGORY_META[place.category];

    return (
        <button
            type="button"
            onClick={onSelect}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group
                ${isSelected
                    ? 'bg-orange-50 border border-orange-200'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
        >
            <span
                className={`flex items-center justify-center w-9 h-9 rounded-xl text-white text-sm shrink-0 ${!place.isActive ? 'opacity-50 grayscale' : ''}`}
                style={{ backgroundColor: meta.color }}
            >
                {meta.emoji}
            </span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-bold truncate ${!place.isActive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {place.name}
                    </p>
                    {!place.isActive && (
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-red-100 text-red-500 shrink-0">OFF</span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">{meta.label}</span>
                    <span className="text-[10px] text-slate-400">{zoneName}</span>
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); onEdit(); }}
                    className="p-1 rounded-lg hover:bg-orange-100 text-slate-400 hover:text-orange-600 transition-colors"
                    aria-label={`${place.name} 수정`}
                >
                    <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); onDelete(); }}
                    className="p-1 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                    aria-label={`${place.name} 삭제`}
                >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                </button>
            </div>
        </button>
    );
}

export function ZonePlaceSidePanel({
    activeTab,
    onChangeTab,
    zones,
    places,
    selectedZoneId,
    selectedPlaceId,
    onSelectZone,
    onSelectPlace,
    onEditZone,
    onDeleteZone,
    onEditPlace,
    onDeletePlace,
}: ZonePlaceSidePanelProps) {
    const innerZones = zones.filter((zone) => zone.zoneType === 'INNER');
    const getSubZones = (parentId: number) => zones.filter((zone) => zone.parentZoneId === parentId);
    const getZoneName = (zoneId: number | null) => {
        if (zoneId === null) return 'OUTER';
        return zones.find((zone) => zone.zoneId === zoneId)?.name ?? '알 수 없음';
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* 탭 헤더 */}
            <div className="flex border-b border-slate-100 shrink-0">
                <button
                    type="button"
                    onClick={() => onChangeTab('zones')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition-all duration-200
                        ${activeTab === 'zones'
                            ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50/50'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <HiOutlineMap className="w-4 h-4" />
                    구역 ({zones.length})
                </button>
                <button
                    type="button"
                    onClick={() => onChangeTab('places')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition-all duration-200
                        ${activeTab === 'places'
                            ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50/50'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <HiOutlineMapPin className="w-4 h-4" />
                    장소 ({places.length})
                </button>
            </div>

            {/* 탭 내용 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {activeTab === 'zones' && (
                    <>
                        {innerZones.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <HiOutlineMap className="w-10 h-10 mb-2" />
                                <p className="text-sm font-medium">등록된 구역이 없습니다</p>
                            </div>
                        )}
                        {innerZones.map((zone) => (
                            <ZoneTreeItem
                                key={zone.zoneId}
                                zone={zone}
                                subZones={getSubZones(zone.zoneId)}
                                isSelected={selectedZoneId === zone.zoneId}
                                onSelect={() => onSelectZone(selectedZoneId === zone.zoneId ? null : zone.zoneId)}
                                onEdit={() => onEditZone(zone)}
                                onDelete={() => onDeleteZone(zone)}
                            />
                        ))}
                    </>
                )}

                {activeTab === 'places' && (
                    <>
                        {places.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <HiOutlineMapPin className="w-10 h-10 mb-2" />
                                <p className="text-sm font-medium">등록된 장소가 없습니다</p>
                            </div>
                        )}
                        {places.map((place) => (
                            <PlaceListItem
                                key={place.placeId}
                                place={place}
                                zoneName={getZoneName(place.zoneId)}
                                isSelected={selectedPlaceId === place.placeId}
                                onSelect={() => onSelectPlace(selectedPlaceId === place.placeId ? null : place.placeId)}
                                onEdit={() => onEditPlace(place)}
                                onDelete={() => onDeletePlace(place)}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
