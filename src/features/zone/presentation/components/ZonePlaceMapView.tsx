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
    HiOutlineArrowPath,
    HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import { useZones } from '@/features/zone/application/hooks/useZones';
import { usePlaces } from '@/features/place/application/hooks/usePlaces';
import { useDevices } from '@/features/device/application/hooks/useDevices';
import { uploadPlaceImageApi } from '@/api/endpoints/place';
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
            <div className="h-full w-full flex flex-col items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 text-slate-400 gap-3">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-[3px] border-slate-200" />
                    <div className="absolute inset-0 w-12 h-12 rounded-full border-[3px] border-orange-500 border-t-transparent animate-spin" />
                </div>
                <p className="text-sm font-semibold tracking-wide">지도를 불러오는 중...</p>
            </div>
        ),
    },
);

type SidePanelTab = 'zones' | 'places' | 'devices';

const DEFAULT_MAP_CENTER = { lat: 37.5796, lng: 126.9770 };
const DEFAULT_MAP_LEVEL = 4;

/** 토스트 알림 타입 */
interface Toast {
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
}

/**
 * 구역·장소·디바이스 통합 관리 뷰
 *
 * 전체 너비 지도 + 플로팅 사이드패널 + FAB 버튼 레이아웃
 * API 연동으로 실시간 데이터 동기화
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
        recalcZones,
        refetchZones,
        isLoading: isZonesLoading,
        isMutating: isZoneMutating,
        error: zoneError,
    } = useZones();

    const {
        filteredPlaces,
        selectedPlaceId,
        setSelectedPlaceId,
        createPlace,
        updatePlace,
        deletePlace,
        refetchPlaces,
        isLoading: isPlacesLoading,
        isMutating: isPlaceMutating,
    } = usePlaces();

    const {
        filteredDevices,
        selectedDeviceId,
        setSelectedDeviceId,
        createDevice,
        updateDevice,
        deleteDevice,
        rotateToken,
        refetchDevices,
        isLoading: isDevicesLoading,
        isMutating: isDeviceMutating,
    } = useDevices();

    const { isPlatformAdmin } = useAuth();
    const { currentSite, sites, setCurrentSite } = useSiteContext();

    const [activeTab, setActiveTab] = useState<SidePanelTab>('zones');
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);

    // ───────── 토스트 알림 ─────────
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: Toast['type'], message: string) => {
        const id = Date.now();
        setToasts((previous) => [...previous, { id, type, message }]);
        setTimeout(() => {
            setToasts((previous) => previous.filter((toast) => toast.id !== id));
        }, 4000);
    }, []);

    // ───────── 지도 마커 필터 상태 ─────────
    const [showZones, setShowZones] = useState(true);
    const [showPlaces, setShowPlaces] = useState(true);
    const [showDevices, setShowDevices] = useState(true);

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

    const isGlobalLoading = isZonesLoading || isPlacesLoading || isDevicesLoading;
    const isMutating = isZoneMutating || isPlaceMutating || isDeviceMutating;

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

    // ───────── CRUD 핸들러 (비동기) ─────────
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

    const handleConfirmDeleteZone = useCallback(async () => {
        if (!zoneDeleteTarget) return;
        try {
            await deleteZone(zoneDeleteTarget.zoneId);
            await Promise.all([refetchPlaces(), refetchDevices()]);
            addToast('success', `'${zoneDeleteTarget.name}' 구역이 삭제되었습니다.`);
        } catch {
            addToast('error', '구역 삭제에 실패했습니다.');
        }
        setIsZoneDeleteOpen(false);
        setZoneDeleteTarget(null);
    }, [zoneDeleteTarget, deleteZone, refetchPlaces, refetchDevices, addToast]);

    const handleConfirmDeletePlace = useCallback(async () => {
        if (!placeDeleteTarget) return;
        try {
            await deletePlace(placeDeleteTarget.placeId);
            addToast('success', `'${placeDeleteTarget.name}' 장소가 삭제되었습니다.`);
        } catch {
            addToast('error', '장소 삭제에 실패했습니다.');
        }
        setIsPlaceDeleteOpen(false);
        setPlaceDeleteTarget(null);
    }, [placeDeleteTarget, deletePlace, addToast]);

    const handleConfirmDeleteDevice = useCallback(async () => {
        if (!deviceDeleteTarget) return;
        try {
            await deleteDevice(deviceDeleteTarget.deviceId);
            addToast('success', `'${deviceDeleteTarget.deviceId}' 디바이스가 비활성화되었습니다.`);
        } catch {
            addToast('error', '디바이스 삭제에 실패했습니다.');
        }
        setIsDeviceDeleteOpen(false);
        setDeviceDeleteTarget(null);
    }, [deviceDeleteTarget, deleteDevice, addToast]);

    const handleConfirmRotateToken = useCallback(async () => {
        if (!deviceTokenTarget) return;
        try {
            const newToken = await rotateToken(deviceTokenTarget.deviceId);
            setDeviceIssuedToken(newToken);
            addToast('success', '토큰이 재발급되었습니다. 새 토큰을 안전하게 저장하세요.');
        } catch {
            addToast('error', '토큰 재발급에 실패했습니다.');
        }
    }, [deviceTokenTarget, rotateToken, addToast]);

    const handleSubmitZoneForm = useCallback(async (request: CreateZoneRequest | UpdateZoneRequest) => {
        try {
            if (zoneFormMode === 'create') {
                await createZone(request as CreateZoneRequest);
                addToast('success', '새 구역이 생성되었습니다.');
            } else if (zoneEditTarget) {
                await updateZone(zoneEditTarget.zoneId, request as UpdateZoneRequest);
                addToast('success', '구역이 수정되었습니다.');
            }
            await Promise.all([refetchPlaces(), refetchDevices()]);
        } catch {
            addToast('error', zoneFormMode === 'create' ? '구역 생성에 실패했습니다.' : '구역 수정에 실패했습니다.');
        }
        setDrawnPolygon([]);
        setIsZoneFormOpen(false);
    }, [zoneFormMode, zoneEditTarget, createZone, updateZone, refetchPlaces, refetchDevices, addToast]);

    const handleImageUpload = useCallback(async (file: File) => {
        if (!currentSite?.siteId) throw new Error('현재 선택된 관광지가 없습니다.');
        const response = await uploadPlaceImageApi(currentSite.siteId, file);
        return response.data.imageUrl;
    }, [currentSite]);

    const handleSubmitPlaceForm = useCallback(async (request: CreatePlaceRequest | UpdatePlaceRequest) => {
        try {
            if (placeFormMode === 'create') {
                await createPlace(request as CreatePlaceRequest);
                addToast('success', '새 장소가 등록되었습니다.');
            } else if (placeEditTarget) {
                await updatePlace(placeEditTarget.placeId, request as UpdatePlaceRequest);
                addToast('success', '장소가 수정되었습니다.');
            }
        } catch {
            addToast('error', placeFormMode === 'create' ? '장소 등록에 실패했습니다.' : '장소 수정에 실패했습니다.');
        }
        setPlacingPosition(null);
        setIsPlaceFormOpen(false);
    }, [placeFormMode, placeEditTarget, createPlace, updatePlace, addToast]);

    const handleSubmitDeviceForm = useCallback(async (request: CreateDeviceRequest | UpdateDeviceRequest) => {
        try {
            if (deviceFormMode === 'create') {
                const result = await createDevice(request as CreateDeviceRequest);
                setDeviceIssuedToken(result.plainToken);
                addToast('success', '디바이스가 등록되었습니다. 토큰을 안전하게 저장하세요.');
            } else if (deviceEditTarget) {
                await updateDevice(deviceEditTarget.deviceId, request as UpdateDeviceRequest);
                addToast('success', '디바이스가 수정되었습니다.');
                setPlacingPosition(null);
                setIsDeviceFormOpen(false);
            }
        } catch {
            addToast('error', deviceFormMode === 'create' ? '디바이스 등록에 실패했습니다.' : '디바이스 수정에 실패했습니다.');
        }
    }, [deviceFormMode, deviceEditTarget, createDevice, updateDevice, addToast]);

    /** 구역 재계산 */
    const handleRecalc = useCallback(async () => {
        try {
            const result = await recalcZones();
            await Promise.all([refetchPlaces(), refetchDevices()]);
            addToast('info',
                `재계산 완료 — 장소 ${result.updatedPlaces}/${result.totalPlaces}건, 디바이스 ${result.updatedDevices}/${result.totalDevices}건 변경`,
            );
        } catch {
            addToast('error', '구역 재계산에 실패했습니다.');
        }
    }, [recalcZones, refetchPlaces, refetchDevices, addToast]);

    const hasSubZones = useMemo(
        () => zoneDeleteTarget ? zones.some((zone) => zone.parentZoneId === zoneDeleteTarget.zoneId) : false,
        [zones, zoneDeleteTarget],
    );

    const isInteracting = interactionMode !== 'idle';

    return (
        <div className="relative h-[calc(100vh-90px)] w-full">
            {/* ═══════ 전체 너비 지도 ═══════ */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm">
                <ZonePlaceMap
                    zones={zones}
                    places={filteredPlaces}
                    devices={filteredDevices}
                    showZones={showZones}
                    showPlaces={showPlaces}
                    showDevices={showDevices}
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

            {/* ═══════ 글로벌 로딩 인디케이터 ═══════ */}
            <AnimatePresence>
                {(isGlobalLoading || isMutating) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 z-30"
                    >
                        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white/95 backdrop-blur-xl rounded-full shadow-lg border border-white/60">
                            <div className="relative w-4 h-4">
                                <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
                                <div className="absolute inset-0 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                            </div>
                            <span className="text-xs font-bold text-slate-600">
                                {isMutating ? '저장 중...' : '데이터 로딩 중...'}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════ 에러 배너 ═══════ */}
            <AnimatePresence>
                {zoneError && !isMutating && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 z-30"
                    >
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50/95 backdrop-blur-xl rounded-2xl shadow-lg border border-red-200/60">
                            <HiOutlineExclamationTriangle className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="text-xs font-bold text-red-700">{zoneError.message}</span>
                            <button
                                onClick={() => { refetchZones(); refetchPlaces(); refetchDevices(); }}
                                className="ml-2 text-xs font-bold text-red-500 hover:text-red-700 underline underline-offset-2"
                            >
                                다시 시도
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════ 다이내믹 아일랜드: 인터랙션 모드 (Top Center) ═══════ */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <AnimatePresence mode="wait">
                    {isInteracting && (
                        <motion.div
                            key="dynamic-island"
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="pointer-events-auto bg-white/90 backdrop-blur-2xl rounded-full shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] border border-slate-200/80 px-2 py-1.5 flex items-center gap-2 overflow-hidden"
                        >
                            {interactionMode === 'drawing' && (
                                <div className="flex items-center gap-1 pl-3 pr-2 border-r border-slate-200/80">
                                    <div className="relative flex h-3 w-3 mr-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                                    </div>
                                    <span className="text-sm font-extrabold text-slate-700">폴리곤 그리기</span>
                                    <span className="text-xs font-bold text-slate-400 ml-1">
                                        ({drawingPoints.length}점{drawingPoints.length < 3 ? ' · 최소 3점' : ''})
                                    </span>
                                </div>
                            )}
                            {interactionMode === 'placing' && (
                                <div className="flex items-center gap-1 pl-3 pr-2 border-r border-slate-200/80">
                                    <div className="relative flex h-3 w-3 mr-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
                                    </div>
                                    <span className="text-sm font-extrabold text-slate-700">
                                        {placingType === 'place' ? '장소 위치 지정' : '디바이스 위치 지정'}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-1">
                                {interactionMode === 'drawing' && (
                                    <>
                                        <button
                                            onClick={undoLastPoint}
                                            disabled={drawingPoints.length === 0}
                                            className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 transition-all flex items-center gap-1"
                                        >
                                            <HiOutlineArrowUturnLeft className="w-3.5 h-3.5" /> 되돌리기
                                        </button>
                                        <button
                                            onClick={finishDrawing}
                                            disabled={drawingPoints.length < 3}
                                            className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs font-bold shadow-sm disabled:opacity-30 transition-all flex items-center gap-1"
                                        >
                                            <HiOutlineCheckCircle className="w-3.5 h-3.5" /> 완료
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={cancelMode}
                                    className="px-3 py-1.5 rounded-full text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition-all flex items-center gap-1"
                                >
                                    <HiOutlineXMark className="w-3.5 h-3.5" /> 취소
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══════ 통합 다이내믹 독 (Bottom Center Header/HUD) ═══════ */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-4xl px-4 flex justify-center">
                <AnimatePresence>
                    {!isInteracting && (
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 40, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="pointer-events-auto flex items-center gap-2 sm:gap-4 p-2 sm:p-2.5 bg-white/75 backdrop-blur-3xl border border-white/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] rounded-full w-max max-w-full"
                        >
                            {/* 1. 사이트 선택 (Platform Admin) */}
                            <div className="relative pl-1 shrink-0">
                                {isPlatformAdmin ? (
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
                                            className="group flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/60 hover:bg-white rounded-full shadow-sm border border-slate-200/50 transition-all active:scale-[0.98]"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-inner">
                                                <HiOutlineMapPin className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <span className="font-extrabold text-slate-800 text-xs sm:text-sm whitespace-nowrap">
                                                {currentSite?.name ?? '관광지 선택'}
                                            </span>
                                            <HiOutlineChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 transition-transform duration-300 ${isSiteDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isSiteDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setIsSiteDropdownOpen(false)} />
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="absolute bottom-full left-0 mb-3 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 py-2 z-50 overflow-hidden"
                                                    >
                                                        {sites.map((site) => (
                                                            <button
                                                                key={site.siteId}
                                                                onClick={() => {
                                                                    setCurrentSite(site.siteId);
                                                                    setIsSiteDropdownOpen(false);
                                                                }}
                                                                className={`w-full text-left px-4 py-3 text-sm font-bold transition-all relative overflow-hidden
                                                                    ${currentSite?.siteId === site.siteId
                                                                        ? 'text-indigo-600 bg-indigo-50/50'
                                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                                    }`}
                                                            >
                                                                {currentSite?.siteId === site.siteId && (
                                                                    <motion.div layoutId="siteActiveIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                                                                )}
                                                                {site.name}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/60 rounded-full shadow-sm border border-slate-200/50">
                                        <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-inner">
                                            <HiOutlineMapPin className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <span className="font-extrabold text-slate-800 text-xs sm:text-sm whitespace-nowrap">{currentSite?.name ?? '관광지'}</span>
                                    </div>
                                )}
                            </div>

                            <div className="w-px h-6 sm:h-8 bg-slate-200/80 rounded-full shrink-0" />

                            {/* 2. 스마트 멀티 필터 */}
                            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 px-1">
                                <button
                                    onClick={() => setShowZones(!showZones)}
                                    className={`group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 border active:scale-95
                                        ${showZones 
                                            ? 'bg-blue-50/90 border-blue-200 shadow-sm text-blue-800' 
                                            : 'bg-white/40 hover:bg-white/90 border-transparent hover:border-slate-200/60 hover:shadow-sm text-slate-500 hover:text-slate-700'}`}
                                >
                                    <HiOutlineMap className={`w-4 h-4 transition-colors ${showZones ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                                    <span className="hidden sm:inline tracking-tight">구역</span>
                                    <kbd className={`px-1.5 py-0.5 rounded-md text-[10px] uppercase font-extrabold tracking-wider transition-colors
                                        ${showZones ? 'bg-blue-200/50 text-blue-700' : 'bg-slate-200/50 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                                        {zones.length}
                                    </kbd>
                                </button>
                                <button
                                    onClick={() => setShowPlaces(!showPlaces)}
                                    className={`group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 border active:scale-95
                                        ${showPlaces 
                                            ? 'bg-orange-50/90 border-orange-200 shadow-sm text-orange-800' 
                                            : 'bg-white/40 hover:bg-white/90 border-transparent hover:border-slate-200/60 hover:shadow-sm text-slate-500 hover:text-slate-700'}`}
                                >
                                    <HiOutlineMapPin className={`w-4 h-4 transition-colors ${showPlaces ? 'text-orange-600' : 'text-slate-400 group-hover:text-orange-500'}`} />
                                    <span className="hidden sm:inline tracking-tight">장소</span>
                                    <kbd className={`px-1.5 py-0.5 rounded-md text-[10px] uppercase font-extrabold tracking-wider transition-colors
                                        ${showPlaces ? 'bg-orange-200/50 text-orange-700' : 'bg-slate-200/50 text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-600'}`}>
                                        {filteredPlaces.length}
                                    </kbd>
                                </button>
                                <button
                                    onClick={() => setShowDevices(!showDevices)}
                                    className={`group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 border active:scale-95
                                        ${showDevices 
                                            ? 'bg-teal-50/90 border-teal-200 shadow-sm text-teal-800' 
                                            : 'bg-white/40 hover:bg-white/90 border-transparent hover:border-slate-200/60 hover:shadow-sm text-slate-500 hover:text-slate-700'}`}
                                >
                                    <HiOutlineDevicePhoneMobile className={`w-4 h-4 transition-colors ${showDevices ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-500'}`} />
                                    <span className="hidden sm:inline tracking-tight">기기</span>
                                    <kbd className={`px-1.5 py-0.5 rounded-md text-[10px] uppercase font-extrabold tracking-wider transition-colors
                                        ${showDevices ? 'bg-teal-200/50 text-teal-700' : 'bg-slate-200/50 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
                                        {filteredDevices.length}
                                    </kbd>
                                </button>
                            </div>

                            <div className="w-px h-6 sm:h-8 bg-slate-200/80 rounded-full shrink-0" />

                            {/* 3. 인라인 액션 버튼 */}
                            <div className="flex items-center gap-1.5 pr-1 shrink-0">
                                <button
                                    onClick={startDrawingMode}
                                    className="group relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white hover:bg-blue-50 border border-slate-200/50 hover:border-blue-200 transition-all active:scale-95"
                                    aria-label="구역 추가"
                                >
                                    <HiOutlineMap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 transition-transform group-hover:scale-110" />
                                    <span className="absolute bottom-full mb-2 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-lg whitespace-nowrap">구역 추가</span>
                                </button>
                                <button
                                    onClick={() => startPlacingMode('place')}
                                    className="group relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white hover:bg-orange-50 border border-slate-200/50 hover:border-orange-200 transition-all active:scale-95"
                                    aria-label="장소 추가"
                                >
                                    <HiOutlinePlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 transition-transform group-hover:scale-110" />
                                    <span className="absolute bottom-full mb-2 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-lg whitespace-nowrap">장소 추가</span>
                                </button>
                                <button
                                    onClick={() => startPlacingMode('device')}
                                    className="group relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white hover:bg-teal-50 border border-slate-200/50 hover:border-teal-200 transition-all active:scale-95"
                                    aria-label="디바이스 추가"
                                >
                                    <HiOutlineDevicePhoneMobile className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 transition-transform group-hover:scale-110" />
                                    <span className="absolute bottom-full mb-2 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded-lg whitespace-nowrap">기기 추가</span>
                                </button>
                                <div className="w-px h-6 bg-slate-200 mx-0.5 sm:mx-1" />
                                <button
                                    onClick={handleRecalc}
                                    disabled={isMutating}
                                    className="group relative flex items-center justify-center pl-2.5 sm:pl-3 pr-3 sm:pr-4 h-9 sm:h-10 rounded-full bg-white hover:bg-violet-50 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-violet-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ml-0.5 sm:ml-1 gap-1.5 sm:gap-2"
                                >
                                    <HiOutlineArrowPath className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-500 ${isMutating ? 'animate-spin' : 'transition-transform group-hover:rotate-180 duration-500'}`} />
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-700 group-hover:text-violet-700 leading-none mt-px">재계산</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══════ 우측: 플로팅 사이드패널 ═══════ */}
            <div className={`absolute top-4 sm:top-6 right-4 sm:right-6 bottom-24 sm:bottom-28 z-40 flex items-start gap-4 transition-all duration-300 pointer-events-none`}>
                <button
                    onClick={() => setIsPanelOpen(!isPanelOpen)}
                    className="mt-4 pointer-events-auto bg-white/80 backdrop-blur-2xl rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-white/60 p-2.5 hover:bg-white transition-all hover:scale-105 active:scale-95 text-slate-500 hover:text-indigo-500"
                    aria-label={isPanelOpen ? '패널 닫기' : '패널 열기'}
                >
                    {isPanelOpen
                        ? <HiOutlineChevronRight className="w-5 h-5" />
                        : <HiOutlineChevronLeft className="w-5 h-5" />
                    }
                </button>

                <AnimatePresence mode="popLayout">
                    {isPanelOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                            className="pointer-events-auto h-full"
                        >
                            <div className="h-full w-[360px] bg-white/50 backdrop-blur-[40px] rounded-[2rem] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] border border-white/80 overflow-hidden flex flex-col ring-1 ring-slate-900/5">
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
                                    isLoading={isGlobalLoading}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══════ 토스트 알림 ═══════ */}
            <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 60, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 60, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`pointer-events-auto px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-xl text-sm font-bold max-w-sm
                                ${toast.type === 'success' ? 'bg-emerald-50/95 border-emerald-200/60 text-emerald-800' : ''}
                                ${toast.type === 'error' ? 'bg-red-50/95 border-red-200/60 text-red-800' : ''}
                                ${toast.type === 'info' ? 'bg-blue-50/95 border-blue-200/60 text-blue-800' : ''}`}
                        >
                            {toast.message}
                        </motion.div>
                    ))}
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
                onImageUpload={handleImageUpload}
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
