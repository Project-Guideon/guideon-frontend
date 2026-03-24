'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineMapPin,
    HiOutlinePlusCircle,
    HiOutlineMap,
    HiOutlineXMark,
    HiOutlineArrowUturnLeft,
    HiOutlineCheckCircle,
    HiOutlineChevronRight,
    HiOutlineChevronLeft,
    HiOutlineChevronDown,
    HiOutlineDevicePhoneMobile,
} from 'react-icons/hi2';
import { useZones } from '@/features/zone/application/hooks/useZones';
import { usePlaces } from '@/features/place/application/hooks/usePlaces';
import { useDevices } from '@/features/device/application/hooks/useDevices';
import { ZonePlaceSidePanel } from './ZonePlaceSidePanel';
import { ZoneFormModal } from './ZoneFormModal';
import { ZoneDeleteDialog } from './ZoneDeleteDialog';
import { PlaceFormModal } from '@/features/place/presentation/components/PlaceFormModal';
import { PlaceDeleteDialog } from '@/features/place/presentation/components/PlaceDeleteDialog';
import { DeviceFormModal } from '@/features/device/presentation/components/DeviceFormModal';
import { DeviceDeleteDialog } from '@/features/device/presentation/components/DeviceDeleteDialog';
import { DeviceTokenDialog } from '@/features/device/presentation/components/DeviceTokenDialog';
import type { Zone, CreateZoneRequest, UpdateZoneRequest } from '@/features/zone/domain/entities/Zone';
import type { Place, CreatePlaceRequest, UpdatePlaceRequest } from '@/features/place/domain/entities/Place';
import type { Device, CreateDeviceRequest, UpdateDeviceRequest } from '@/features/device/domain/entities/Device';
import type { MapInteractionMode } from './ZonePlaceMap';
import { useAuth, useSiteContext } from '@/features/auth/application/hooks/useAuth';

const ZonePlaceMap = dynamic(
    () => import('./ZonePlaceMap').then((module) => module.ZonePlaceMap),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                <p className="text-sm font-medium">지도를 불러오는 중입니다...</p>
            </div>
        ),
    },
);

type SidePanelTab = 'zones' | 'places' | 'devices';

const DEFAULT_MAP_CENTER = { lat: 37.5796, lng: 126.9770 };
const DEFAULT_MAP_LEVEL = 4;

/**
 * 구역·장소 통합 관리 뷰
 *
 * 전체 너비 지도 + 플로팅 사이드패널 + FAB 버튼 레이아웃
 */
export function ZonePlaceMapView() {
    const {
        zones,
        innerZones,
        selectedZoneId,
        setSelectedZoneId,
        createZone,
        updateZone,
        deleteZone,
    } = useZones();

    const {
        filteredPlaces,
        selectedPlaceId,
        setSelectedPlaceId,
        createPlace,
        updatePlace,
        deletePlace,
        clearZoneReferences,
    } = usePlaces();

    const {
        filteredDevices,
        selectedDeviceId,
        setSelectedDeviceId,
        createDevice,
        updateDevice,
        deleteDevice,
        rotateToken,
    } = useDevices();

    const { isPlatformAdmin } = useAuth();
    const { currentSite, sites, setCurrentSite } = useSiteContext();

    const [activeTab, setActiveTab] = useState<SidePanelTab>('zones');
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);

    // ───────── 지도 인터랙션 모드 ─────────
    const [interactionMode, setInteractionMode] = useState<MapInteractionMode>('idle');
    const [drawingPoints, setDrawingPoints] = useState<{ lat: number; lng: number }[]>([]);
    const [placingPosition, setPlacingPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [placingType, setPlacingType] = useState<'place' | 'device'>('place');

    // ───────── Zone 모달 상태 ─────────
    const [isZoneFormOpen, setIsZoneFormOpen] = useState(false);
    const [zoneFormMode, setZoneFormMode] = useState<'create' | 'edit'>('create');
    const [zoneEditTarget, setZoneEditTarget] = useState<Zone | null>(null);
    const [isZoneDeleteOpen, setIsZoneDeleteOpen] = useState(false);
    const [zoneDeleteTarget, setZoneDeleteTarget] = useState<Zone | null>(null);
    const [drawnPolygon, setDrawnPolygon] = useState<{ lat: number; lng: number }[]>([]);

    // ───────── Place 모달 상태 ─────────
    const [isPlaceFormOpen, setIsPlaceFormOpen] = useState(false);
    const [placeFormMode, setPlaceFormMode] = useState<'create' | 'edit'>('create');
    const [placeEditTarget, setPlaceEditTarget] = useState<Place | null>(null);
    const [isPlaceDeleteOpen, setIsPlaceDeleteOpen] = useState(false);
    const [placeDeleteTarget, setPlaceDeleteTarget] = useState<Place | null>(null);
    const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({ lat: 37.5796, lng: 126.9770 });

    // ───────── Device 모달 상태 ─────────
    const [isDeviceFormOpen, setIsDeviceFormOpen] = useState(false);
    const [deviceFormMode, setDeviceFormMode] = useState<'create' | 'edit'>('create');
    const [deviceEditTarget, setDeviceEditTarget] = useState<Device | null>(null);
    const [isDeviceDeleteOpen, setIsDeviceDeleteOpen] = useState(false);
    const [deviceDeleteTarget, setDeviceDeleteTarget] = useState<Device | null>(null);
    const [isDeviceTokenOpen, setIsDeviceTokenOpen] = useState(false);
    const [deviceTokenTarget, setDeviceTokenTarget] = useState<Device | null>(null);
    const [deviceIssuedToken, setDeviceIssuedToken] = useState<string | null>(null);

    // ───────── 모드 전환 ─────────
    const startDrawingMode = useCallback(() => {
        setInteractionMode('drawing');
        setDrawingPoints([]);
        setSelectedZoneId(null);
        setSelectedPlaceId(null);
        setSelectedDeviceId(null);
    }, [setSelectedZoneId, setSelectedPlaceId, setSelectedDeviceId]);

    const startPlacingMode = useCallback((type: 'place' | 'device') => {
        setInteractionMode('placing');
        setPlacingType(type);
        setPlacingPosition(null);
        setSelectedZoneId(null);
        setSelectedPlaceId(null);
        setSelectedDeviceId(null);
    }, [setSelectedZoneId, setSelectedPlaceId, setSelectedDeviceId]);

    const cancelMode = useCallback(() => {
        setInteractionMode('idle');
        setDrawingPoints([]);
        setPlacingPosition(null);
    }, []);

    const undoLastPoint = useCallback(() => {
        setDrawingPoints((previous) => previous.slice(0, -1));
    }, []);

    const handleMapClick = useCallback((lat: number, lng: number) => {
        if (interactionMode === 'drawing') {
            setDrawingPoints((previous) => [...previous, { lat, lng }]);
        } else if (interactionMode === 'placing') {
            setPlacingPosition({ lat, lng });
            setSelectedCoords({ lat, lng });
            if (placingType === 'place') {
                setPlaceFormMode('create');
                setPlaceEditTarget(null);
                setIsPlaceFormOpen(true);
            } else {
                setDeviceFormMode('create');
                setDeviceEditTarget(null);
                setDeviceIssuedToken(null);
                setIsDeviceFormOpen(true);
            }
            setInteractionMode('idle');
        }
    }, [interactionMode, placingType]);

    const finishDrawing = useCallback(() => {
        if (drawingPoints.length < 3) return;
        setDrawnPolygon([...drawingPoints]);
        setInteractionMode('idle');
        setZoneFormMode('create');
        setZoneEditTarget(null);
        setIsZoneFormOpen(true);
        setDrawingPoints([]);
    }, [drawingPoints]);

    // ───────── CRUD ─────────
    const handleEditZone = useCallback((zone: Zone) => {
        setZoneFormMode('edit');
        setZoneEditTarget(zone);
        setIsZoneFormOpen(true);
    }, []);

    const handleDeleteZone = useCallback((zone: Zone) => {
        setZoneDeleteTarget(zone);
        setIsZoneDeleteOpen(true);
    }, []);

    const handleEditPlace = useCallback((place: Place) => {
        setPlaceFormMode('edit');
        setPlaceEditTarget(place);
        setSelectedCoords({ lat: place.latitude, lng: place.longitude });
        setIsPlaceFormOpen(true);
    }, []);

    const handleDeletePlace = useCallback((place: Place) => {
        setPlaceDeleteTarget(place);
        setIsPlaceDeleteOpen(true);
    }, []);

    const handleEditDevice = useCallback((device: Device) => {
        setDeviceFormMode('edit');
        setDeviceEditTarget(device);
        setSelectedCoords({ lat: device.latitude, lng: device.longitude });
        setDeviceIssuedToken(null);
        setIsDeviceFormOpen(true);
    }, []);

    const handleDeleteDevice = useCallback((device: Device) => {
        setDeviceDeleteTarget(device);
        setIsDeviceDeleteOpen(true);
    }, []);

    const handleRotateToken = useCallback((device: Device) => {
        setDeviceTokenTarget(device);
        setDeviceIssuedToken(null);
        setIsDeviceTokenOpen(true);
    }, []);

    const handleConfirmDeleteZone = useCallback(() => {
        if (zoneDeleteTarget) {
            deleteZone(zoneDeleteTarget.zoneId, (deletedIds) => {
                clearZoneReferences(deletedIds);
            });
            setIsZoneDeleteOpen(false);
            setZoneDeleteTarget(null);
        }
    }, [zoneDeleteTarget, deleteZone, clearZoneReferences]);

    const handleConfirmDeletePlace = useCallback(() => {
        if (placeDeleteTarget) {
            deletePlace(placeDeleteTarget.placeId);
            setIsPlaceDeleteOpen(false);
            setPlaceDeleteTarget(null);
        }
    }, [placeDeleteTarget, deletePlace]);

    const handleConfirmDeleteDevice = useCallback(() => {
        if (deviceDeleteTarget) {
            deleteDevice(deviceDeleteTarget.deviceId);
            setIsDeviceDeleteOpen(false);
            setDeviceDeleteTarget(null);
        }
    }, [deviceDeleteTarget, deleteDevice]);

    const handleConfirmRotateToken = useCallback(() => {
        if (deviceTokenTarget) {
            const newToken = rotateToken(deviceTokenTarget.deviceId);
            setDeviceIssuedToken(newToken);
        }
    }, [deviceTokenTarget, rotateToken]);

    const handleSubmitZoneForm = useCallback((request: CreateZoneRequest | UpdateZoneRequest) => {
        if (zoneFormMode === 'create') {
            createZone(request as CreateZoneRequest);
        } else if (zoneEditTarget) {
            updateZone(zoneEditTarget.zoneId, request as UpdateZoneRequest);
        }
        setDrawnPolygon([]);
        setIsZoneFormOpen(false);
    }, [zoneFormMode, zoneEditTarget, createZone, updateZone]);

    const handleSubmitPlaceForm = useCallback((request: CreatePlaceRequest | UpdatePlaceRequest) => {
        if (placeFormMode === 'create') {
            createPlace(request as CreatePlaceRequest);
        } else if (placeEditTarget) {
            updatePlace(placeEditTarget.placeId, request as UpdatePlaceRequest);
        }
        setPlacingPosition(null);
        setIsPlaceFormOpen(false);
    }, [placeFormMode, placeEditTarget, createPlace, updatePlace]);

    const handleSubmitDeviceForm = useCallback((request: CreateDeviceRequest | UpdateDeviceRequest) => {
        if (deviceFormMode === 'create') {
            const { plainToken } = createDevice(request as CreateDeviceRequest);
            setDeviceIssuedToken(plainToken);
        } else if (deviceEditTarget) {
            updateDevice(deviceEditTarget.deviceId, request as UpdateDeviceRequest);
            setPlacingPosition(null);
            setIsDeviceFormOpen(false);
        }
    }, [deviceFormMode, deviceEditTarget, createDevice, updateDevice]);

    const hasSubZones = useMemo(
        () => zoneDeleteTarget ? zones.some((zone) => zone.parentZoneId === zoneDeleteTarget.zoneId) : false,
        [zones, zoneDeleteTarget],
    );

    const isInteracting = interactionMode !== 'idle';

    return (
        <div className="relative h-[calc(100vh-90px)] w-full">
            {/* ═══════ 전체 너비 지도 ═══════ */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <ZonePlaceMap
                    zones={zones}
                    places={filteredPlaces}
                    devices={filteredDevices}
                    selectedZoneId={selectedZoneId}
                    selectedPlaceId={selectedPlaceId}
                    selectedDeviceId={selectedDeviceId}
                    onSelectZone={setSelectedZoneId}
                    onSelectPlace={setSelectedPlaceId}
                    onSelectDevice={setSelectedDeviceId}
                    mapCenter={DEFAULT_MAP_CENTER}
                    mapLevel={DEFAULT_MAP_LEVEL}
                    mode={interactionMode}
                    drawingPoints={drawingPoints}
                    placingPosition={placingPosition}
                    onMapClick={handleMapClick}
                />
            </div>

            {/* ═══════ 좌상단: 페이지 타이틀 배지 & 사이트 선택 ═══════ */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 px-5 py-3">
                    <div className="flex items-center gap-2 mb-1.5">
                        <HiOutlineMapPin className="w-5 h-5 text-orange-500 shrink-0" />
                        {isPlatformAdmin ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
                                    className="flex items-center gap-1.5 bg-transparent text-base font-black text-slate-800 outline-none hover:text-orange-600 transition-colors"
                                >
                                    {currentSite?.name ?? '관광지 선택'}
                                    <HiOutlineChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSiteDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isSiteDropdownOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setIsSiteDropdownOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute top-full left-0 mt-2 w-40 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/50 py-1.5 z-50 overflow-hidden"
                                            >
                                                {sites.map((site) => (
                                                    <button
                                                        key={site.siteId}
                                                        onClick={() => {
                                                            setCurrentSite(site.siteId);
                                                            setIsSiteDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-all
                                                            ${currentSite?.siteId === site.siteId
                                                                ? 'bg-orange-50/50 text-orange-600'
                                                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                                            }`}
                                                    >
                                                        {site.name}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <h2 className="text-base font-black text-slate-800">{currentSite?.name ?? '알 수 없는 관광지'}</h2>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                        구역 <span className="font-bold text-orange-600">{zones.length}</span> · 장소 <span className="font-bold text-orange-600">{filteredPlaces.length}</span> · 디바이스 <span className="font-bold text-violet-600">{filteredDevices.length}</span>
                    </p>
                </div>
            </div>

            {/* ═══════ Drawing/Placing 모드 툴바 (상단 중앙) ═══════ */}
            <AnimatePresence>
                {isInteracting && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
                    >
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 px-4 py-2.5 flex items-center gap-3">
                            {interactionMode === 'drawing' && (
                                <>
                                    <div className="flex items-center gap-2 text-sm font-bold text-orange-600">
                                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                        폴리곤 그리기
                                        <span className="text-slate-400 font-medium">
                                            ({drawingPoints.length}점{drawingPoints.length < 3 ? ' · 최소 3점' : ''})
                                        </span>
                                    </div>
                                    <div className="w-px h-5 bg-slate-200" />
                                    <button
                                        onClick={undoLastPoint}
                                        disabled={drawingPoints.length === 0}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-30"
                                    >
                                        <HiOutlineArrowUturnLeft className="w-3.5 h-3.5" />
                                        되돌리기
                                    </button>
                                    <button
                                        onClick={finishDrawing}
                                        disabled={drawingPoints.length < 3}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                                        완료
                                    </button>
                                </>
                            )}
                            {interactionMode === 'placing' && placingType === 'place' && (
                                <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    지도를 클릭하여 장소 위치를 선택하세요
                                </div>
                            )}
                            {interactionMode === 'placing' && placingType === 'device' && (
                                <div className="flex items-center gap-2 text-sm font-bold text-violet-600">
                                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                                    지도를 클릭하여 디바이스 위치를 선택하세요
                                </div>
                            )}
                            <button
                                onClick={cancelMode}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <HiOutlineXMark className="w-3.5 h-3.5" />
                                취소
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════ 좌하단: FAB 액션 버튼 ═══════ */}
            <AnimatePresence>
                {!isInteracting && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-6 left-6 z-10 flex flex-col gap-2"
                    >
                        <button
                            onClick={startDrawingMode}
                            className="group flex items-center gap-2.5 pl-4 pr-5 py-3 bg-white/95 backdrop-blur-md border border-white/50 text-slate-700 rounded-2xl shadow-lg
                                hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 hover:shadow-xl transition-all duration-200 active:scale-[0.97]"
                        >
                            <div className="w-8 h-8 rounded-xl bg-blue-500 group-hover:bg-blue-600 flex items-center justify-center transition-colors">
                                <HiOutlineMap className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-bold">구역 추가</span>
                        </button>
                        <button
                            onClick={() => startPlacingMode('place')}
                            className="group flex items-center gap-2.5 pl-4 pr-5 py-3 bg-white/95 backdrop-blur-md border border-white/50 text-slate-700 rounded-2xl shadow-lg
                                hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 hover:shadow-xl transition-all duration-200 active:scale-[0.97]"
                        >
                            <div className="w-8 h-8 rounded-xl bg-orange-500 group-hover:bg-orange-600 flex items-center justify-center transition-colors">
                                <HiOutlinePlusCircle className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-bold">장소 추가</span>
                        </button>
                        <button
                            onClick={() => startPlacingMode('device')}
                            className="group flex items-center gap-2.5 pl-4 pr-5 py-3 bg-white/95 backdrop-blur-md border border-white/50 text-slate-700 rounded-2xl shadow-lg
                                hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 hover:shadow-xl transition-all duration-200 active:scale-[0.97]"
                        >
                            <div className="w-8 h-8 rounded-xl bg-violet-500 group-hover:bg-violet-600 flex items-center justify-center transition-colors">
                                <HiOutlineDevicePhoneMobile className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-bold">디바이스 추가</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════ 우측: 플로팅 사이드패널 ═══════ */}
            <div className="absolute top-4 right-4 bottom-4 z-10 flex items-stretch gap-2">
                {/* 패널 토글 버튼 */}
                <button
                    onClick={() => setIsPanelOpen(!isPanelOpen)}
                    className="self-center bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-2 hover:bg-slate-50 transition-all"
                    aria-label={isPanelOpen ? '패널 닫기' : '패널 열기'}
                >
                    {isPanelOpen
                        ? <HiOutlineChevronRight className="w-4 h-4 text-slate-500" />
                        : <HiOutlineChevronLeft className="w-4 h-4 text-slate-500" />
                    }
                </button>

                {/* 사이드패널 */}
                <AnimatePresence>
                    {isPanelOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 30, width: 0 }}
                            animate={{ opacity: 1, x: 0, width: 320 }}
                            exit={{ opacity: 0, x: 30, width: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="overflow-hidden"
                        >
                            <div className="h-full w-[320px] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden">
                                <ZonePlaceSidePanel
                                    activeTab={activeTab}
                                    onChangeTab={setActiveTab}
                                    zones={zones}
                                    places={filteredPlaces}
                                    devices={filteredDevices}
                                    selectedZoneId={selectedZoneId}
                                    selectedPlaceId={selectedPlaceId}
                                    selectedDeviceId={selectedDeviceId}
                                    onSelectZone={setSelectedZoneId}
                                    onSelectPlace={setSelectedPlaceId}
                                    onSelectDevice={setSelectedDeviceId}
                                    onEditZone={handleEditZone}
                                    onDeleteZone={handleDeleteZone}
                                    onEditPlace={handleEditPlace}
                                    onDeletePlace={handleDeletePlace}
                                    onEditDevice={handleEditDevice}
                                    onDeleteDevice={handleDeleteDevice}
                                    onRotateToken={handleRotateToken}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══════ 모달 ═══════ */}
            <ZoneFormModal
                key={`zone-${zoneFormMode}-${zoneEditTarget?.zoneId ?? 'new'}-${isZoneFormOpen}`}
                isOpen={isZoneFormOpen}
                mode={zoneFormMode}
                editTarget={zoneEditTarget}
                parentZones={innerZones}
                drawnPolygon={drawnPolygon}
                onClose={() => { setIsZoneFormOpen(false); setDrawnPolygon([]); }}
                onSubmit={handleSubmitZoneForm}
            />
            <ZoneDeleteDialog
                isOpen={isZoneDeleteOpen}
                zoneName={zoneDeleteTarget?.name ?? ''}
                hasSubZones={hasSubZones}
                onClose={() => setIsZoneDeleteOpen(false)}
                onConfirm={handleConfirmDeleteZone}
            />
            <PlaceFormModal
                key={`place-${placeFormMode}-${placeEditTarget?.placeId ?? 'new'}-${isPlaceFormOpen}`}
                isOpen={isPlaceFormOpen}
                mode={placeFormMode}
                editTarget={placeEditTarget}
                zones={zones}
                selectedCoords={selectedCoords}
                onClose={() => { setIsPlaceFormOpen(false); setPlacingPosition(null); }}
                onSubmit={handleSubmitPlaceForm}
            />
            <PlaceDeleteDialog
                isOpen={isPlaceDeleteOpen}
                placeName={placeDeleteTarget?.name ?? ''}
                onClose={() => setIsPlaceDeleteOpen(false)}
                onConfirm={handleConfirmDeletePlace}
            />
            <DeviceFormModal
                key={`device-${deviceFormMode}-${deviceEditTarget?.deviceId ?? 'new'}-${isDeviceFormOpen}`}
                isOpen={isDeviceFormOpen}
                mode={deviceFormMode}
                editTarget={deviceEditTarget}
                zones={zones}
                selectedCoords={selectedCoords}
                issuedToken={deviceIssuedToken}
                onClose={() => { setIsDeviceFormOpen(false); setPlacingPosition(null); setDeviceIssuedToken(null); }}
                onSubmit={handleSubmitDeviceForm}
            />
            <DeviceDeleteDialog
                isOpen={isDeviceDeleteOpen}
                deviceId={deviceDeleteTarget?.deviceId ?? ''}
                onClose={() => setIsDeviceDeleteOpen(false)}
                onConfirm={handleConfirmDeleteDevice}
            />
            <DeviceTokenDialog
                key={`device-token-${deviceTokenTarget?.deviceId}-${isDeviceTokenOpen}`}
                isOpen={isDeviceTokenOpen}
                deviceId={deviceTokenTarget?.deviceId ?? ''}
                newToken={deviceIssuedToken}
                onClose={() => { setIsDeviceTokenOpen(false); setDeviceIssuedToken(null); }}
                onConfirmRotate={handleConfirmRotateToken}
            />
        </div>
    );
}
