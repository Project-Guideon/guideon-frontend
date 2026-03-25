'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMapPin, HiOutlineMap, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineDevicePhoneMobile, HiOutlineKey } from 'react-icons/hi2';
import type { Zone } from '@/features/zone/domain/entities/Zone';
import type { Place } from '@/features/place/domain/entities/Place';
import { PLACE_CATEGORY_META } from '@/features/place/domain/entities/Place';
import { PlaceCategoryIcon } from '@/features/place/presentation/components/PlaceCategoryIcon';
import type { Device } from '@/features/device/domain/entities/Device';

export type TabType = 'zones' | 'places' | 'devices';

interface ZonePlaceSidePanelProps {
    activeTab: TabType;
    onChangeTab: (tab: TabType) => void;
    zones: Zone[];
    places: Place[];
    devices: Device[];
    selectedZoneId: number | null;
    selectedPlaceId: number | null;
    selectedDeviceId: string | null;
    onSelectZone: (zoneId: number | null) => void;
    onSelectPlace: (placeId: number | null) => void;
    onSelectDevice: (deviceId: string | null) => void;
    onEditZone: (zone: Zone) => void;
    onDeleteZone: (zone: Zone) => void;
    onEditPlace: (place: Place) => void;
    onDeletePlace: (place: Place) => void;
    onEditDevice: (device: Device) => void;
    onDeleteDevice: (device: Device) => void;
    onRotateToken: (device: Device) => void;
    isLoading?: boolean;
}

function ZoneTreeItem({
    zone,
    subZones,
    selectedZoneId,
    onSelect,
    onEdit,
    onDelete,
    onEditSubZone,
    onDeleteSubZone,
}: {
    zone: Zone;
    subZones: Zone[];
    selectedZoneId: number | null;
    onSelect: (zoneId: number) => void;
    onEdit: () => void;
    onDelete: () => void;
    onEditSubZone: (subZone: Zone) => void;
    onDeleteSubZone: (subZone: Zone) => void;
}) {
    return (
        <div>
            <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(zone.zoneId)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect(zone.zoneId);
                    }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 group cursor-pointer
                    ${selectedZoneId === zone.zoneId
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
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shrink-0">
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
            </div>
            {subZones.length > 0 && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 pl-2">
                    {subZones.map((sub) => (
                        <div
                            role="button"
                            tabIndex={0}
                            key={sub.zoneId}
                            onClick={() => onSelect(sub.zoneId)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onSelect(sub.zoneId);
                                }
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all duration-200 group text-sm cursor-pointer
                                ${selectedZoneId === sub.zoneId
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'hover:bg-slate-50 text-slate-600'
                                }`}
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                <span className="font-medium truncate">{sub.name}</span>
                                <span className="text-[10px] text-slate-400 shrink-0">{sub.code}</span>
                            </div>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shrink-0">
                                <button
                                    type="button"
                                    onClick={(event) => { event.stopPropagation(); onEditSubZone(sub); }}
                                    className="p-1 rounded-lg hover:bg-emerald-100 text-slate-400 hover:text-emerald-700 transition-colors"
                                    aria-label={`${sub.name} 수정`}
                                >
                                    <HiOutlinePencilSquare className="w-3 h-3" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(event) => { event.stopPropagation(); onDeleteSubZone(sub); }}
                                    className="p-1 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
                                    aria-label={`${sub.name} 삭제`}
                                >
                                    <HiOutlineTrash className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

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
        <div
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect();
                }
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group cursor-pointer
                ${isSelected
                    ? 'bg-orange-50 border border-orange-200'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
        >
            <PlaceCategoryIcon
                category={place.category}
                size="lg"
                color={meta.color}
                className={!place.isActive ? 'opacity-50 grayscale' : ''}
            />
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
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shrink-0">
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
        </div>
    );
}

function DeviceListItem({
    device,
    zoneName,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    onRotateToken,
}: {
    device: Device;
    zoneName: string;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onRotateToken: () => void;
}) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect();
                }
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group cursor-pointer
                ${isSelected
                    ? 'bg-teal-50 border border-teal-200'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
        >
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${device.isActive ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400 opacity-50'}`}>
                <HiOutlineDevicePhoneMobile className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-bold truncate ${!device.isActive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {device.locationName}
                    </p>
                    {!device.isActive && (
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-red-100 text-red-500 shrink-0">OFF</span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 truncate">{device.deviceId}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{zoneName}</span>
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shrink-0">
                <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); onEdit(); }}
                    className="p-1 rounded-lg hover:bg-teal-100 text-slate-400 hover:text-teal-600 transition-colors"
                    aria-label={`${device.locationName} 수정`}
                >
                    <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); onRotateToken(); }}
                    className="p-1 rounded-lg hover:bg-amber-100 text-slate-400 hover:text-amber-600 transition-colors"
                    aria-label={`${device.locationName} 토큰 재발급`}
                >
                    <HiOutlineKey className="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); onDelete(); }}
                    className="p-1 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                    aria-label={`${device.locationName} 삭제`}
                >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

function ZonePlaceSidePanelInner({
    activeTab,
    onChangeTab,
    zones,
    places,
    devices,
    selectedZoneId,
    selectedPlaceId,
    selectedDeviceId,
    onSelectZone,
    onSelectPlace,
    onSelectDevice,
    onEditZone,
    onDeleteZone,
    onEditPlace,
    onDeletePlace,
    onEditDevice,
    onDeleteDevice,
    onRotateToken,
    isLoading,
}: ZonePlaceSidePanelProps) {
    const innerZones = zones.filter((zone) => zone.zoneType === 'INNER');
    const getSubZones = (parentId: number) => zones.filter((zone) => zone.parentZoneId === parentId);
    const getZoneName = (zoneId: number | null) => {
        if (zoneId === null) return 'OUTER';
        return zones.find((zone) => zone.zoneId === zoneId)?.name ?? '알 수 없음';
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white/50 backdrop-blur-sm">
            <div className="flex border-b border-slate-100 shrink-0 px-2 pt-2 bg-white">
                <button
                    type="button"
                    onClick={() => onChangeTab('zones')}
                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-t-xl text-xs font-bold transition-all duration-200
                        ${activeTab === 'zones'
                            ? 'text-orange-600 bg-orange-50/80 shadow-[inset_0_-2px_0_0_#ea580c]'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <HiOutlineMap className="w-5 h-5" />
                    <span>구역 ({zones.length})</span>
                </button>
                <button
                    type="button"
                    onClick={() => onChangeTab('places')}
                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-t-xl text-xs font-bold transition-all duration-200
                        ${activeTab === 'places'
                            ? 'text-orange-600 bg-orange-50/80 shadow-[inset_0_-2px_0_0_#ea580c]'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <HiOutlineMapPin className="w-5 h-5" />
                    <span>장소 ({places.length})</span>
                </button>
                <button
                    type="button"
                    onClick={() => onChangeTab('devices')}
                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-t-xl text-xs font-bold transition-all duration-200
                        ${activeTab === 'devices'
                            ? 'text-teal-600 bg-teal-50/80 shadow-[inset_0_-2px_0_0_#0d9488]'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <HiOutlineDevicePhoneMobile className="w-5 h-5" />
                    <span>디바이스 ({devices.length})</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
                {/* 로딩 스켈레톤 */}
                {isLoading && (
                    <div className="space-y-2 animate-pulse">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="flex items-center gap-3 px-3 py-3 rounded-xl">
                                <div className="w-2 h-2 rounded-full bg-slate-200 shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3.5 bg-slate-200 rounded-md w-3/4" />
                                    <div className="h-2.5 bg-slate-100 rounded-md w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {!isLoading && activeTab === 'zones' && (
                        <motion.div
                            key="tab-zones"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-1"
                        >
                            {innerZones.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <HiOutlineMap className="w-10 h-10 mb-2 opacity-50" />
                                    <p className="text-sm font-semibold">등록된 구역이 없습니다</p>
                                    <p className="text-xs mt-1 text-slate-300">좌측 하단의 구역 추가 버튼을 눌러보세요</p>
                                </div>
                            ) : (
                                innerZones.map((zone) => (
                                    <ZoneTreeItem
                                        key={zone.zoneId}
                                        zone={zone}
                                        subZones={getSubZones(zone.zoneId)}
                                        selectedZoneId={selectedZoneId}
                                        onSelect={(clickedZoneId) => onSelectZone(selectedZoneId === clickedZoneId ? null : clickedZoneId)}
                                        onEdit={() => onEditZone(zone)}
                                        onDelete={() => onDeleteZone(zone)}
                                        onEditSubZone={(sub) => onEditZone(sub)}
                                        onDeleteSubZone={(sub) => onDeleteZone(sub)}
                                    />
                                ))
                            )}
                        </motion.div>
                    )}

                    {!isLoading && activeTab === 'places' && (
                        <motion.div
                            key="tab-places"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-1"
                        >
                            {places.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <HiOutlineMapPin className="w-10 h-10 mb-2 opacity-50" />
                                    <p className="text-sm font-semibold">등록된 장소가 없습니다</p>
                                    <p className="text-xs mt-1 text-slate-300">좌측 하단의 장소 추가 버튼을 눌러보세요</p>
                                </div>
                            ) : (
                                places.map((place) => (
                                    <PlaceListItem
                                        key={place.placeId}
                                        place={place}
                                        zoneName={getZoneName(place.zoneId)}
                                        isSelected={selectedPlaceId === place.placeId}
                                        onSelect={() => onSelectPlace(selectedPlaceId === place.placeId ? null : place.placeId)}
                                        onEdit={() => onEditPlace(place)}
                                        onDelete={() => onDeletePlace(place)}
                                    />
                                ))
                            )}
                        </motion.div>
                    )}

                    {!isLoading && activeTab === 'devices' && (
                        <motion.div
                            key="tab-devices"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-1"
                        >
                            {devices.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <HiOutlineDevicePhoneMobile className="w-10 h-10 mb-2 opacity-50" />
                                    <p className="text-sm font-semibold">등록된 디바이스가 없습니다</p>
                                    <p className="text-xs mt-1 text-slate-300">좌측 하단의 디바이스 추가 버튼을 눌러보세요</p>
                                </div>
                            ) : (
                                devices.map((device) => (
                                    <DeviceListItem
                                        key={device.deviceId}
                                        device={device}
                                        zoneName={getZoneName(device.zoneId)}
                                        isSelected={selectedDeviceId === device.deviceId}
                                        onSelect={() => onSelectDevice(selectedDeviceId === device.deviceId ? null : device.deviceId)}
                                        onEdit={() => onEditDevice(device)}
                                        onDelete={() => onDeleteDevice(device)}
                                        onRotateToken={() => onRotateToken(device)}
                                    />
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export const ZonePlaceSidePanel = memo(ZonePlaceSidePanelInner);
