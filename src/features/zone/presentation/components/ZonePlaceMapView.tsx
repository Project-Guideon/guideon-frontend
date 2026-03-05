'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
    HiOutlineMapPin,
    HiOutlinePlusCircle,
    HiOutlineMap,
} from 'react-icons/hi2';
import { useZones } from '@/features/zone/application/hooks/useZones';
import { usePlaces } from '@/features/place/application/hooks/usePlaces';
import { ZonePlaceSidePanel } from './ZonePlaceSidePanel';
import { ZoneFormModal } from './ZoneFormModal';
import { ZoneDeleteDialog } from './ZoneDeleteDialog';
import { PlaceFormModal } from '@/features/place/presentation/components/PlaceFormModal';
import { PlaceDeleteDialog } from '@/features/place/presentation/components/PlaceDeleteDialog';
import type { Zone, CreateZoneRequest, UpdateZoneRequest } from '@/features/zone/domain/entities/Zone';
import type { Place, CreatePlaceRequest, UpdatePlaceRequest } from '@/features/place/domain/entities/Place';

/** SSR 비활성 — 카카오맵은 브라우저 전용 */
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

type SidePanelTab = 'zones' | 'places';

/** 경복궁 기준 지도 초기 위치 */
const DEFAULT_MAP_CENTER = { lat: 37.5796, lng: 126.9770 };
const DEFAULT_MAP_LEVEL = 4;

/**
 * 구역·장소 통합 관리 뷰
 *
 * 카카오맵 + 사이드패널(구역 트리 / 장소 목록) 2컬럼 레이아웃
 */
export function ZonePlaceMapView() {
    const {
        zones,
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
    } = usePlaces();

    const [activeTab, setActiveTab] = useState<SidePanelTab>('zones');

    // 모달 상태 (커밋 3에서 실제 모달 연결)
    const [isZoneFormOpen, setIsZoneFormOpen] = useState(false);
    const [zoneFormMode, setZoneFormMode] = useState<'create' | 'edit'>('create');
    const [zoneEditTarget, setZoneEditTarget] = useState<Zone | null>(null);
    const [isZoneDeleteOpen, setIsZoneDeleteOpen] = useState(false);
    const [zoneDeleteTarget, setZoneDeleteTarget] = useState<Zone | null>(null);

    const [isPlaceFormOpen, setIsPlaceFormOpen] = useState(false);
    const [placeFormMode, setPlaceFormMode] = useState<'create' | 'edit'>('create');
    const [placeEditTarget, setPlaceEditTarget] = useState<Place | null>(null);
    const [isPlaceDeleteOpen, setIsPlaceDeleteOpen] = useState(false);
    const [placeDeleteTarget, setPlaceDeleteTarget] = useState<Place | null>(null);

    // ───────────── 이벤트 핸들러 ─────────────

    const handleClickCreateZone = () => {
        setZoneFormMode('create');
        setZoneEditTarget(null);
        setIsZoneFormOpen(true);
    };

    const handleClickCreatePlace = () => {
        setPlaceFormMode('create');
        setPlaceEditTarget(null);
        setIsPlaceFormOpen(true);
    };

    const handleEditZone = (zone: Zone) => {
        setZoneFormMode('edit');
        setZoneEditTarget(zone);
        setIsZoneFormOpen(true);
    };

    const handleDeleteZone = (zone: Zone) => {
        setZoneDeleteTarget(zone);
        setIsZoneDeleteOpen(true);
    };

    const handleEditPlace = (place: Place) => {
        setPlaceFormMode('edit');
        setPlaceEditTarget(place);
        setIsPlaceFormOpen(true);
    };

    const handleDeletePlace = (place: Place) => {
        setPlaceDeleteTarget(place);
        setIsPlaceDeleteOpen(true);
    };

    const handleConfirmDeleteZone = () => {
        if (zoneDeleteTarget) {
            deleteZone(zoneDeleteTarget.zoneId);
            setIsZoneDeleteOpen(false);
            setZoneDeleteTarget(null);
        }
    };

    const handleConfirmDeletePlace = () => {
        if (placeDeleteTarget) {
            deletePlace(placeDeleteTarget.placeId);
            setIsPlaceDeleteOpen(false);
            setPlaceDeleteTarget(null);
        }
    };

    const handleSubmitZoneForm = (request: CreateZoneRequest | UpdateZoneRequest) => {
        if (zoneFormMode === 'create') {
            createZone(request as CreateZoneRequest);
        } else if (zoneEditTarget) {
            updateZone(zoneEditTarget.zoneId, request as UpdateZoneRequest);
        }
    };

    const handleSubmitPlaceForm = (request: CreatePlaceRequest | UpdatePlaceRequest) => {
        if (placeFormMode === 'create') {
            createPlace(request as CreatePlaceRequest);
        } else if (placeEditTarget) {
            updatePlace(placeEditTarget.placeId, request as UpdatePlaceRequest);
        }
    };

    const innerZones = zones.filter((zone) => zone.zoneType === 'INNER');
    const hasSubZones = zoneDeleteTarget
        ? zones.some((zone) => zone.parentZoneId === zoneDeleteTarget.zoneId)
        : false;

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-90px)]">
            {/* 페이지 헤더 */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <HiOutlineMapPin className="w-7 h-7 text-orange-500" />
                        구역·장소 관리
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        구역 <span className="font-bold text-orange-600">{zones.length}</span>개 · 장소 <span className="font-bold text-orange-600">{filteredPlaces.length}</span>개
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleClickCreateZone}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm
                            hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 active:scale-[0.98]"
                    >
                        <HiOutlineMap className="w-4 h-4" />
                        구역 추가
                    </button>
                    <button
                        onClick={handleClickCreatePlace}
                        className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm
                            hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all duration-200 active:scale-[0.98]"
                    >
                        <HiOutlinePlusCircle className="w-4 h-4" />
                        장소 추가
                    </button>
                </div>
            </div>

            {/* 지도 + 사이드패널 */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
                {/* 지도 (좌측 2/3) */}
                <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 min-h-[400px]">
                    <ZonePlaceMap
                        zones={zones}
                        places={filteredPlaces}
                        selectedZoneId={selectedZoneId}
                        selectedPlaceId={selectedPlaceId}
                        onSelectZone={setSelectedZoneId}
                        onSelectPlace={setSelectedPlaceId}
                        mapCenter={DEFAULT_MAP_CENTER}
                        mapLevel={DEFAULT_MAP_LEVEL}
                    />
                </div>

                {/* 사이드패널 (우측 1/3) */}
                <div className="min-h-[400px]">
                    <ZonePlaceSidePanel
                        activeTab={activeTab}
                        onChangeTab={setActiveTab}
                        zones={zones}
                        places={filteredPlaces}
                        selectedZoneId={selectedZoneId}
                        selectedPlaceId={selectedPlaceId}
                        onSelectZone={setSelectedZoneId}
                        onSelectPlace={setSelectedPlaceId}
                        onEditZone={handleEditZone}
                        onDeleteZone={handleDeleteZone}
                        onEditPlace={handleEditPlace}
                        onDeletePlace={handleDeletePlace}
                    />
                </div>
            </div>

            {/* Zone 모달 */}
            <ZoneFormModal
                isOpen={isZoneFormOpen}
                mode={zoneFormMode}
                editTarget={zoneEditTarget}
                parentZones={innerZones}
                onClose={() => setIsZoneFormOpen(false)}
                onSubmit={handleSubmitZoneForm}
            />
            <ZoneDeleteDialog
                isOpen={isZoneDeleteOpen}
                zoneName={zoneDeleteTarget?.name ?? ''}
                hasSubZones={hasSubZones}
                onClose={() => setIsZoneDeleteOpen(false)}
                onConfirm={handleConfirmDeleteZone}
            />

            {/* Place 모달 */}
            <PlaceFormModal
                isOpen={isPlaceFormOpen}
                mode={placeFormMode}
                editTarget={placeEditTarget}
                zones={zones}
                onClose={() => setIsPlaceFormOpen(false)}
                onSubmit={handleSubmitPlaceForm}
            />
            <PlaceDeleteDialog
                isOpen={isPlaceDeleteOpen}
                placeName={placeDeleteTarget?.name ?? ''}
                onClose={() => setIsPlaceDeleteOpen(false)}
                onConfirm={handleConfirmDeletePlace}
            />
        </div>
    );
}
