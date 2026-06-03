'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
    HiOutlineBuildingLibrary,
    HiOutlinePencilSquare,
    HiXMark,
    HiOutlineMapPin,
} from 'react-icons/hi2';
import type { CreateSiteRequest, UpdateSiteRequest } from '@/features/site/domain/entities/Site';

/** 지도 피커 — SSR 비활성화 (카카오맵 SDK는 브라우저 전용) */
const SiteMapPicker = dynamic(
    () => import('./SiteMapPicker').then((module) => module.SiteMapPicker),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-72 rounded-xl bg-slate-100 flex items-center justify-center gap-3 text-slate-400">
                <div className="relative w-8 h-8">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
                    <div className="absolute inset-0 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
                </div>
                <p className="text-sm font-medium">지도 로딩 중...</p>
            </div>
        ),
    },
);

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
 * 관광지 생성/수정 모달
 *
 * - 장소 검색으로 빠르게 위치 지정
 * - 지도 드래그·줌으로 세부 조정
 * - 수정 시 좌표를 항상 전송해 null 덮어쓰기 방지
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

    /**
     * 지도 피커가 onChange를 호출할 때마다 이 state가 갱신됩니다.
     * 초기값은 props에서 읽어 지도 로드 전 제출 시에도 기존 좌표를 보존합니다.
     */
    const [mapCoords, setMapCoords] = useState<{
        latitude: number | null;
        longitude: number | null;
        mapLevel: number | null;
    }>({
        latitude: initialLatitude ?? null,
        longitude: initialLongitude ?? null,
        mapLevel: initialMapLevel ?? null,
    });

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

    /** 지도 피커 변경 핸들러 */
    const handleMapChange = useCallback((latitude: number, longitude: number, mapLevel: number) => {
        setMapCoords({ latitude, longitude, mapLevel });
    }, []);

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

        onSubmit({
            name: trimmedName,
            latitude: mapCoords.latitude,
            longitude: mapCoords.longitude,
            mapLevel: mapCoords.mapLevel,
        });
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
                        className="relative w-full max-w-[580px] bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)]
                            will-change-transform max-h-[90vh] flex flex-col"
                    >
                        {/* 헤더 */}
                        <div className="flex items-center gap-3 px-7 pt-7 pb-1 shrink-0">
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
                                        ? '이름을 입력하고 지도에서 위치를 설정하세요'
                                        : '이름과 지도 위치를 변경합니다'
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
                        <div className="mx-7 mt-5 h-px bg-slate-100 shrink-0" />

                        {/* 스크롤 가능한 본문 */}
                        <div className="overflow-y-auto flex-1 px-7 pt-5 pb-2">
                            {/* 관광지 이름 */}
                            <div className="mb-5">
                                <label
                                    htmlFor="site-name-input"
                                    className="block text-[13px] font-semibold text-slate-700 mb-2"
                                >
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

                            {/* 지도 위치 섹션 */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <HiOutlineMapPin className="w-4 h-4 text-slate-500" />
                                    <span className="text-[13px] font-semibold text-slate-700">
                                        지도 위치
                                    </span>
                                    <span className="ml-auto text-[11px] text-slate-400 font-normal">
                                        선택 사항
                                    </span>
                                </div>

                                <SiteMapPicker
                                    initialLatitude={initialLatitude}
                                    initialLongitude={initialLongitude}
                                    initialMapLevel={initialMapLevel}
                                    onChange={handleMapChange}
                                />
                            </div>
                        </div>

                        {/* 버튼 영역 */}
                        <div className="flex items-center gap-3 px-7 py-5 border-t border-slate-100 shrink-0">
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
