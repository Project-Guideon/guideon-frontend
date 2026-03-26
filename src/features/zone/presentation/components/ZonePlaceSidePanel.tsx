'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMapPin, HiOutlineMap, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineDevicePhoneMobile, HiOutlineKey, HiChevronRight } from 'react-icons/hi2';
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

function TossActionButtons({
    onEdit,
    onDelete,
    onRotateToken,
}: {
    onEdit?: () => void;
    onDelete?: () => void;
    onRotateToken?: () => void;
}) {
    // 토스 스타일 액션 버튼: 마우스 호버 시에 우측에 큰 버튼이 통통 튀어나오도록 처리
    return (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 z-10 px-1 py-1 bg-white/60 backdrop-blur-md rounded-[1.2rem]">
            {onEdit && (
                <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); onEdit(); }}
                    className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                >
                    <HiOutlinePencilSquare className="w-4 h-4" />
                </button>
            )}
            {onRotateToken && (
                <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); onRotateToken(); }}
                    className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-500 transition-colors"
                >
                    <HiOutlineKey className="w-4 h-4" />
                </button>
            )}
            {onDelete && (
                <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); onDelete(); }}
                    className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                >
                    <HiOutlineTrash className="w-4 h-4" />
                </button>
            )}
        </div>
    );
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
    const isSelected = selectedZoneId === zone.zoneId;

    return (
        <div className="mb-2">
            <motion.div
                whileTap={{ scale: 0.97 }}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(zone.zoneId)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect(zone.zoneId);
                    }
                }}
                className={`relative w-full flex items-center gap-4 p-4 rounded-[1.5rem] text-left transition-colors duration-200 group cursor-pointer outline-none mb-1
                    ${isSelected ? 'bg-blue-50/60' : 'bg-transparent hover:bg-slate-50'}`}
            >
                {/* 토스 스타일: 크고 둥근 스쿼클 아이콘 */}
                <div className={`w-[52px] h-[52px] rounded-[1.2rem] flex items-center justify-center shrink-0
                    ${zone.zoneType === 'INNER' ? 'bg-blue-100 text-blue-500' : 'bg-emerald-100 text-emerald-500'}`}>
                    <HiOutlineMap className="w-[26px] h-[26px]" />
                </div>
                
                {/* 텍스트부: 여백과 두꺼운 폰트 */}
                <div className="flex-1 min-w-0 pr-8">
                    <p className={`text-[17px] font-bold truncate tracking-tight transition-colors ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>{zone.name}</p>
                    <p className="text-[13px] font-medium text-slate-500 mt-0.5 truncate">{zone.zoneType === 'INNER' ? '실내' : '실외'} · {zone.code}</p>
                </div>

                {/* 기본 상태에서는 셰브론, 호버 시 액션 버튼 */}
                <div className="absolute right-5 group-hover:opacity-0 transition-opacity text-slate-300">
                    <HiChevronRight className="w-5 h-5" />
                </div>
                <TossActionButtons onEdit={onEdit} onDelete={onDelete} />
            </motion.div>

            {/* 서브존 영역: 동일한 토스 스타일이지만 약간 작게 */}
            {subZones.length > 0 && (
                <div className="ml-12 mt-1 space-y-1">
                    {subZones.map((sub) => {
                        const isSubSelected = selectedZoneId === sub.zoneId;
                        return (
                            <motion.div
                                whileTap={{ scale: 0.97 }}
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
                                className={`relative w-full flex items-center gap-3.5 p-3 rounded-[1.2rem] text-left transition-colors duration-200 group cursor-pointer outline-none
                                    ${isSubSelected ? 'bg-emerald-50/60' : 'bg-transparent hover:bg-slate-50'}`}
                            >
                                <div className="w-[40px] h-[40px] rounded-[1rem] bg-emerald-100 flex items-center justify-center shrink-0">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                </div>
                                <div className="flex-1 min-w-0 pr-8">
                                    <p className={`text-[15px] font-bold truncate tracking-tight transition-colors ${isSubSelected ? 'text-emerald-700' : 'text-slate-800'}`}>{sub.name}</p>
                                    <p className="text-[12px] font-medium text-slate-400 truncate uppercase mt-0.5">{sub.code}</p>
                                </div>
                                <div className="absolute right-4 group-hover:opacity-0 transition-opacity text-slate-300">
                                    <HiChevronRight className="w-4 h-4" />
                                </div>
                                <TossActionButtons onEdit={() => onEditSubZone(sub)} onDelete={() => onDeleteSubZone(sub)} />
                            </motion.div>
                        );
                    })}
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
        <motion.div
            whileTap={{ scale: 0.97 }}
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect();
                }
            }}
            className={`relative w-full flex items-center gap-4 p-4 rounded-[1.5rem] text-left transition-colors duration-200 group cursor-pointer border-transparent outline-none mb-2
                ${isSelected ? 'bg-orange-50/60' : 'bg-transparent hover:bg-slate-50'}`}
        >
            <div className={`relative w-[52px] h-[52px] rounded-[1.2rem] shrink-0 overflow-hidden flex items-center justify-center ${place.imageUrl ? '' : 'bg-slate-100 text-slate-500'}`}>
                {place.imageUrl ? (
                    <img src={place.imageUrl} alt={place.name} className={`w-full h-full object-cover ${!place.isActive ? 'opacity-40 grayscale' : ''}`} />
                ) : (
                    <PlaceCategoryIcon category={place.category} size="xl" color={meta.color} className={!place.isActive ? 'opacity-40 grayscale' : ''} />
                )}
                {/* 뱃지: 토스 느낌으로 아이콘 우측 하단이나 이름 옆에 배치, 여기서는 좌측 아이콘 오버레이로 처리하거나 생략 */}
            </div>

            <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-1.5">
                    <p className={`text-[17px] font-bold truncate tracking-tight transition-colors ${!place.isActive ? 'text-slate-400 line-through' : isSelected ? 'text-orange-700' : 'text-slate-900'}`}>
                        {place.name}
                    </p>
                    {!place.isActive && <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-[0.4rem]">비활성</span>}
                </div>
                <p className="text-[13px] font-medium text-slate-500 mt-0.5 truncate">{meta.label} · {zoneName}</p>
            </div>

            <div className="absolute right-5 group-hover:opacity-0 transition-opacity text-slate-300">
                <HiChevronRight className="w-5 h-5" />
            </div>
            <TossActionButtons onEdit={onEdit} onDelete={onDelete} />
        </motion.div>
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
        <motion.div
            whileTap={{ scale: 0.97 }}
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect();
                }
            }}
            className={`relative w-full flex items-center gap-4 p-4 rounded-[1.5rem] text-left transition-colors duration-200 group cursor-pointer border-transparent outline-none mb-2
                ${isSelected ? 'bg-teal-50/60' : 'bg-transparent hover:bg-slate-50'}`}
        >
            <div className={`w-[52px] h-[52px] rounded-[1.2rem] flex items-center justify-center shrink-0 
                ${device.isActive ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                <HiOutlineDevicePhoneMobile className="w-[26px] h-[26px]" />
            </div>

            <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-1.5">
                    <p className={`text-[17px] font-bold truncate tracking-tight transition-colors ${!device.isActive ? 'text-slate-400 line-through' : isSelected ? 'text-teal-700' : 'text-slate-900'}`}>
                        {device.locationName}
                    </p>
                    {!device.isActive && <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-[0.4rem]">오프라인</span>}
                </div>
                <p className="text-[13px] font-medium text-slate-500 mt-0.5 truncate">{device.deviceId} · {zoneName}</p>
            </div>

            <div className="absolute right-5 group-hover:opacity-0 transition-opacity text-slate-300">
                <HiChevronRight className="w-5 h-5" />
            </div>
            <TossActionButtons onEdit={onEdit} onDelete={onDelete} onRotateToken={onRotateToken} />
        </motion.div>
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
        <div className="h-full flex flex-col bg-white">
            {/* 토스 스타일 거대한 헤더 */}
            <div className="px-6 pt-10 pb-4 shrink-0 bg-white z-10">
                <h2 className="text-[26px] font-black text-slate-900 tracking-tight leading-tight">
                    구역 및 장소
                </h2>
                <p className="text-[14px] font-medium text-slate-500 mt-1.5">
                    {zones.length}개의 구역과 {places.length}개의 장소
                </p>
            </div>

            {/* 토스 스타일 빵빵한 세그먼트 탭 */}
            <div className="px-5 pb-3 shrink-0 bg-white z-10">
                <div className="relative flex p-1.5 bg-slate-100 rounded-[1.2rem]">
                    {(['zones', 'places', 'devices'] as const).map((tab) => {
                        const isSelected = activeTab === tab;
                        const count = tab === 'zones' ? zones.length : tab === 'places' ? places.length : devices.length;
                        return (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => onChangeTab(tab)}
                                className={`relative flex-1 py-3.5 rounded-[1rem] transition-colors duration-300 text-[15px] font-bold outline-none
                                    ${isSelected ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {isSelected && (
                                    <motion.div
                                        layoutId="tossTabBg"
                                        className="absolute inset-0 bg-white rounded-[1rem] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                                        initial={false}
                                        transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center justify-center gap-1.5">
                                    {tab === 'zones' ? '구역' : tab === 'places' ? '장소' : '기기'} 
                                    <span className={`text-[13px] ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>{count}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 리스트 본문 */}
            <div className="flex-1 overflow-y-auto px-3 pb-8 relative z-0 no-scrollbar bg-white">
                {isLoading && (
                    <div className="px-3 space-y-4 animate-pulse mt-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-[52px] h-[52px] rounded-[1.2rem] bg-slate-100 shrink-0" />
                                <div className="flex-1 space-y-2.5">
                                    <div className="h-4 bg-slate-100 rounded-md w-2/3" />
                                    <div className="h-3 bg-slate-50 rounded-md w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {!isLoading && activeTab === 'zones' && (
                        <motion.div key="tab-zones" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="pt-2">
                            {innerZones.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-4"><HiOutlineMap className="w-8 h-8" /></div>
                                    <p className="text-[17px] font-bold text-slate-800">등록된 구역이 없어요</p>
                                    <p className="text-[14px] font-medium text-slate-500 mt-1">하단 중앙 메뉴에서 구역을 추가해보세요</p>
                                </div>
                            ) : (
                                innerZones.map((zone) => (
                                    <ZoneTreeItem key={zone.zoneId} zone={zone} subZones={getSubZones(zone.zoneId)} selectedZoneId={selectedZoneId} onSelect={(clickedZoneId) => onSelectZone(selectedZoneId === clickedZoneId ? null : clickedZoneId)} onEdit={() => onEditZone(zone)} onDelete={() => onDeleteZone(zone)} onEditSubZone={(sub) => onEditZone(sub)} onDeleteSubZone={(sub) => onDeleteZone(sub)} />
                                ))
                            )}
                        </motion.div>
                    )}

                    {!isLoading && activeTab === 'places' && (
                        <motion.div key="tab-places" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="pt-2">
                            {places.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-4"><HiOutlineMapPin className="w-8 h-8" /></div>
                                    <p className="text-[17px] font-bold text-slate-800">등록된 장소가 없어요</p>
                                    <p className="text-[14px] font-medium text-slate-500 mt-1">하단 중앙 메뉴에서 장소를 추가해보세요</p>
                                </div>
                            ) : (
                                places.map((place) => (
                                    <PlaceListItem key={place.placeId} place={place} zoneName={getZoneName(place.zoneId)} isSelected={selectedPlaceId === place.placeId} onSelect={() => onSelectPlace(selectedPlaceId === place.placeId ? null : place.placeId)} onEdit={() => onEditPlace(place)} onDelete={() => onDeletePlace(place)} />
                                ))
                            )}
                        </motion.div>
                    )}

                    {!isLoading && activeTab === 'devices' && (
                        <motion.div key="tab-devices" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="pt-2">
                            {devices.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-4"><HiOutlineDevicePhoneMobile className="w-8 h-8" /></div>
                                    <p className="text-[17px] font-bold text-slate-800">등록된 기기가 없어요</p>
                                    <p className="text-[14px] font-medium text-slate-500 mt-1">하단 중앙 메뉴에서 기기를 추가해보세요</p>
                                </div>
                            ) : (
                                devices.map((device) => (
                                    <DeviceListItem key={device.deviceId} device={device} zoneName={getZoneName(device.zoneId)} isSelected={selectedDeviceId === device.deviceId} onSelect={() => onSelectDevice(selectedDeviceId === device.deviceId ? null : device.deviceId)} onEdit={() => onEditDevice(device)} onDelete={() => onDeleteDevice(device)} onRotateToken={() => onRotateToken(device)} />
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
