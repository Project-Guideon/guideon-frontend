'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
    HiOutlineBuildingLibrary,
    HiOutlinePencilSquare,
    HiXMark,
    HiOutlineMapPin,
} from 'react-icons/hi2';
import type { CreateSiteRequest, UpdateSiteRequest } from '@/features/site/domain/entities/Site';

/** 카카오맵 타입 선언 (SSR 우회용) */
declare global {
    interface Window {
        kakao: {
            maps: {
                Map: new (container: HTMLElement, options: object) => KakaoMap;
                LatLng: new (lat: number, lng: number) => KakaoLatLng;
                event: {
                    addListener: (target: object, eventName: string, callback: () => void) => void;
                };
            };
        };
    }
}

interface KakaoLatLng {
    getLat: () => number;
    getLng: () => number;
}

interface KakaoMap {
    getCenter: () => KakaoLatLng;
    getLevel: () => number;
    setCenter: (latLng: KakaoLatLng) => void;
    setLevel: (level: number) => void;
    relayout: () => void;
}

/** 좌표 기본값 (서울시청) */
const DEFAULT_LATITUDE = 37.5796;
const DEFAULT_LONGITUDE = 126.9770;
const DEFAULT_MAP_LEVEL = 4;

/**
 * SiteFormModalProps
 */
interface SiteFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    initialName: string;
    initialLatitude?: number | null;
    initialLongitude?: number | null;
    initialMapLevel?: number | null;
    onClose: () => void;
    onSubmit: (request: CreateSiteRequest | UpdateSiteRequest) => void;
}

/**
 * 오버레이 애니메이션
 */
const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

/**
 * 모달 본체 애니메이션
 */
const modalVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, damping: 28, stiffness: 350 },
    },
    exit: {
        opacity: 0,
        y: 16,
        transition: { duration: 0.15, ease: 'easeIn' as const },
    },
};

/**
 * 관광지 생성/수정 모달 (카카오맵 위치 피커 포함)
 *
 * - 생성: 좌표는 선택값. 지도를 조정하면 자동으로 캡처됩니다.
 * - 수정: 기존 좌표가 지도에 표시됩니다. 항상 전체 좌표를 함께 전송해 null 덮어쓰기를 방지합니다.
 */
export function SiteFormModal({
    isOpen,
    mode,
    initialName,
    initialLatitude,
    initialLongitude,
    initialMapLevel,
    onClose,
    onSubmit,
}: SiteFormModalProps) {
    const [name, setName] = useState(initialName);
    const [nameError, setNameError] = useState('');

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const kakaoMapRef = useRef<KakaoMap | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    const isCreateMode = mode === 'create';

    /** ESC 키로 닫기 */
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    /** 카카오맵 초기화 */
    useEffect(() => {
        if (!isOpen || !mapContainerRef.current) return;

        const initializeMap = () => {
            if (!mapContainerRef.current || !window.kakao?.maps) return;

            const centerLatitude = initialLatitude ?? DEFAULT_LATITUDE;
            const centerLongitude = initialLongitude ?? DEFAULT_LONGITUDE;
            const level = initialMapLevel ?? DEFAULT_MAP_LEVEL;

            const center = new window.kakao.maps.LatLng(centerLatitude, centerLongitude);
            const kakaoMap = new window.kakao.maps.Map(mapContainerRef.current, {
                center,
                level,
            });

            kakaoMapRef.current = kakaoMap;
            setIsMapReady(true);
        };

        // 카카오맵 SDK가 이미 로드되어 있으면 즉시 초기화
        if (window.kakao?.maps) {
            // 짧은 딜레이로 DOM 마운트 보장
            const timer = setTimeout(initializeMap, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen, initialLatitude, initialLongitude, initialMapLevel]);

    /** 모달 닫힐 때 지도 인스턴스 초기화 */
    useEffect(() => {
        if (!isOpen) {
            kakaoMapRef.current = null;
            setIsMapReady(false);
        }
    }, [isOpen]);

    /** 폼 제출 핸들러 */
    const handleSubmitForm = () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            setNameError('관광지 이름을 입력해주세요.');
            return;
        }

        if (trimmedName.length > 100) {
            setNameError('관광지 이름은 100자 이내로 입력해주세요.');
            return;
        }

        let latitude: number | null = null;
        let longitude: number | null = null;
        let mapLevel: number | null = null;

        if (kakaoMapRef.current) {
            const center = kakaoMapRef.current.getCenter();
            latitude = center.getLat();
            longitude = center.getLng();
            mapLevel = kakaoMapRef.current.getLevel();
        } else if (initialLatitude != null && initialLongitude != null) {
            // 지도 미로드 시 기존 값 유지
            latitude = initialLatitude;
            longitude = initialLongitude;
            mapLevel = initialMapLevel ?? null;
        }

        onSubmit({ name: trimmedName, latitude, longitude, mapLevel });
        onClose();
    };

    /** Enter 키 제출 */
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSubmitForm();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-5000 flex items-center justify-center p-4">
                    {/* 오버레이 */}
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.15 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 will-change-[opacity]"
                    />

                    {/* 모달 본체 */}
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="siteFormTitle"
                        className="relative w-full max-w-[520px] bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] will-change-transform"
                    >
                        {/* 헤더 */}
                        <div className="flex items-center gap-3 px-7 pt-7 pb-1">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                ${isCreateMode
                                    ? 'bg-linear-to-br from-orange-400 to-orange-600'
                                    : 'bg-linear-to-br from-blue-400 to-blue-600'
                                }
                            `}>
                                {isCreateMode
                                    ? <HiOutlineBuildingLibrary className="w-5 h-5 text-white" />
                                    : <HiOutlinePencilSquare className="w-5 h-5 text-white" />
                                }
                            </div>
                            <div className="flex-1">
                                <h3 id="siteFormTitle" className="text-lg font-bold text-slate-900">
                                    {isCreateMode ? '새 관광지 추가' : '관광지 수정'}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {isCreateMode
                                        ? '새로운 관광지를 시스템에 등록합니다'
                                        : '관광지 이름과 지도 위치를 변경합니다'
                                    }
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="모달 닫기"
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300
                                    hover:text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                <HiXMark className="w-5 h-5" />
                            </button>
                        </div>

                        {/* 구분선 */}
                        <div className="mx-7 mt-5 mb-0 h-px bg-slate-100" />

                        {/* 입력 폼 */}
                        <div className="px-7 pt-5 pb-2">
                            <label htmlFor="site-name-input" className="block text-[13px] font-semibold text-slate-700 mb-2">
                                관광지 이름
                            </label>
                            <input
                                id="site-name-input"
                                type="text"
                                value={name}
                                onChange={(event) => {
                                    setName(event.target.value);
                                    if (nameError) setNameError('');
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="예: 에버랜드, 경복궁, 제주 민속촌"
                                className={`w-full h-12 px-4 bg-slate-50 border rounded-xl text-sm font-medium text-slate-800
                                    placeholder:text-slate-300 outline-none transition-all duration-150
                                    ${nameError
                                        ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                        : 'border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white'
                                    }
                                `}
                                autoFocus
                            />
                            <div className="h-5 mt-1.5">
                                {nameError && (
                                    <p className="text-xs font-medium text-red-500">{nameError}</p>
                                )}
                            </div>
                        </div>

                        {/* 지도 피커 */}
                        <div className="px-7 pb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <HiOutlineMapPin className="w-4 h-4 text-slate-500" />
                                <span className="text-[13px] font-semibold text-slate-700">지도 위치</span>
                                <span className="text-[11px] text-slate-400 ml-1">
                                    (지도를 움직여 관광지 중심 위치를 설정하세요)
                                </span>
                            </div>

                            <div className="relative w-full h-52 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                <div ref={mapContainerRef} className="w-full h-full" />

                                {/* 중심 고정 마커 */}
                                {isMapReady && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="relative flex flex-col items-center">
                                            <div className="w-5 h-5 rounded-full bg-orange-500 border-2 border-white shadow-lg" />
                                            <div className="w-px h-3 bg-orange-500" />
                                            <div className="w-2 h-1 rounded-full bg-orange-500/40" />
                                        </div>
                                    </div>
                                )}

                                {/* 지도 미로드 안내 */}
                                {!isMapReady && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                                        <div className="relative w-8 h-8">
                                            <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
                                            <div className="absolute inset-0 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
                                        </div>
                                        <p className="text-xs font-medium">지도 로딩 중...</p>
                                    </div>
                                )}
                            </div>

                            {/* 좌표 없음 안내 (생성 모드, 기존 좌표 없을 때) */}
                            {isCreateMode && !initialLatitude && (
                                <p className="mt-2 text-[11px] text-slate-400">
                                    좌표를 설정하지 않으면 기본 위치(서울시청)로 저장됩니다. 생략 가능합니다.
                                </p>
                            )}
                        </div>

                        {/* 버튼 영역 */}
                        <div className="flex items-center gap-3 px-7 pb-7">
                            <button
                                onClick={onClose}
                                className="flex-1 h-11 rounded-xl font-semibold text-sm text-slate-500 bg-slate-100
                                    hover:bg-slate-200 transition-colors duration-150"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSubmitForm}
                                className={`flex-1 h-11 rounded-xl font-semibold text-sm text-white transition-colors duration-150
                                    ${isCreateMode
                                        ? 'bg-orange-500 hover:bg-orange-600'
                                        : 'bg-blue-500 hover:bg-blue-600'
                                    }
                                `}
                            >
                                {isCreateMode ? '관광지 추가' : '변경사항 저장'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
