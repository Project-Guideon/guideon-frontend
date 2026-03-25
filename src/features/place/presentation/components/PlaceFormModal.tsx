'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark, HiOutlineMapPin, HiOutlineChevronDown } from 'react-icons/hi2';
import type { Place, PlaceCategory, CreatePlaceRequest, UpdatePlaceRequest } from '@/features/place/domain/entities/Place';
import { PLACE_CATEGORY_META } from '@/features/place/domain/entities/Place';
import { PlaceCategoryIcon } from '@/features/place/presentation/components/PlaceCategoryIcon';
import type { Zone } from '@/features/zone/domain/entities/Zone';

const CATEGORIES = Object.entries(PLACE_CATEGORY_META) as [PlaceCategory, { label: string; color: string }][];

interface PlaceFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    editTarget: Place | null;
    zones: Zone[];
    /** 메인 지도에서 클릭한 좌표 (create 모드) */
    selectedCoords: { lat: number; lng: number };
    onClose: () => void;
    onSubmit: (request: CreatePlaceRequest | UpdatePlaceRequest) => void | Promise<void>;
}

/**
 * 장소 생성/수정 모달 (경량 — 지도 없음)
 *
 * - 좌표는 메인 지도에서 미리 클릭하여 선택된 상태로 전달됨
 * - Material Design 아이콘 기반 카테고리 그리드
 * - key prop 기반 remount
 */
export function PlaceFormModal({ isOpen, mode, editTarget, zones, selectedCoords, onClose, onSubmit }: PlaceFormModalProps) {
    const [name, setName] = useState(mode === 'edit' && editTarget ? editTarget.name : '');
    const [category, setCategory] = useState<PlaceCategory>(mode === 'edit' && editTarget ? editTarget.category : 'ATTRACTION');
    const [description, setDescription] = useState(mode === 'edit' && editTarget ? (editTarget.description ?? '') : '');
    const [nameEn, setNameEn] = useState(mode === 'edit' && editTarget ? (editTarget.nameJson?.en ?? '') : '');
    const [zoneId, setZoneId] = useState<number | null>(mode === 'edit' && editTarget ? editTarget.zoneId : null);
    const [isActive, setIsActive] = useState(mode === 'edit' && editTarget ? editTarget.isActive : true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const latitude = mode === 'edit' && editTarget ? editTarget.latitude : selectedCoords.lat;
    const longitude = mode === 'edit' && editTarget ? editTarget.longitude : selectedCoords.lng;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const nameJson = nameEn ? { en: nameEn } : undefined;

            if (mode === 'create') {
                const request: CreatePlaceRequest = {
                    name,
                    category,
                    latitude,
                    longitude,
                    description: description || undefined,
                    nameJson,
                    zoneSource: zoneId != null ? 'MANUAL' : 'AUTO',
                    zoneId: zoneId ?? undefined,
                    isActive,
                };
                await onSubmit(request);
            } else {
                const request: UpdatePlaceRequest = {
                    name,
                    category,
                    description: description || undefined,
                    nameJson,
                    isActive,
                    zoneSource: zoneId != null ? 'MANUAL' : 'AUTO',
                    zoneId: zoneId ?? undefined,
                };
                await onSubmit(request);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = name.trim().length > 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40"
                            onClick={onClose}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full max-w-lg text-left bg-white rounded-2xl shadow-2xl flex flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <HiOutlineMapPin className="w-5 h-5 text-orange-500" />
                                    {mode === 'create' ? '장소 추가' : '장소 수정'}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                    aria-label="닫기"
                                >
                                    <HiOutlineXMark className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* 선택된 좌표 배너 */}
                                {mode === 'create' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shrink-0">
                                            <HiOutlineMapPin className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-blue-600 mb-0.5">선택된 위치</p>
                                            <p className="text-[11px] font-medium text-blue-800">
                                                {latitude.toFixed(6)}, {longitude.toFixed(6)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* 장소명 */}
                                <div>
                                    <label htmlFor="place-name" className="block text-sm font-bold text-slate-700 mb-1.5">장소명 *</label>
                                    <input
                                        id="place-name"
                                        type="text"
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="예: 근정전 화장실"
                                        maxLength={100}
                                        autoFocus
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                                    />
                                </div>

                                {/* 영문 이름 */}
                                <div>
                                    <label htmlFor="place-name-en" className="block text-sm font-bold text-slate-700 mb-1.5">영문명 (선택)</label>
                                    <input
                                        id="place-name-en"
                                        type="text"
                                        value={nameEn}
                                        onChange={(event) => setNameEn(event.target.value)}
                                        placeholder="예: Geunjeongjeon Restroom"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                                    />
                                </div>

                                {/* 카테고리 — Material Design 아이콘 */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">카테고리 *</label>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {CATEGORIES.map(([key, meta]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setCategory(key)}
                                                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all border
                                                ${category === key
                                                        ? 'border-orange-300 bg-orange-50 text-orange-700 shadow-sm'
                                                        : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <PlaceCategoryIcon
                                                    category={key}
                                                    size="md"
                                                    color={category === key ? meta.color : '#94a3b8'}
                                                />
                                                <span className="mt-0.5">{meta.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 구역 선택 */}
                                <div>
                                    <label htmlFor="place-zone" className="block text-sm font-bold text-slate-700 mb-1.5">소속 구역 (선택)</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            aria-haspopup="listbox"
                                            aria-expanded={isDropdownOpen}
                                            aria-controls="place-zone-options"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                                        >
                                            <span className={zoneId != null ? 'text-slate-800' : 'text-slate-400'}>
                                                {zoneId === null
                                                    ? '자동 배정 (좌표 기반)'
                                                    : zones.find(z => z.zoneId === zoneId)?.name ?? '알 수 없음'}
                                            </span>
                                            <HiOutlineChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                                                    <motion.div
                                                        id="place-zone-options"
                                                        role="listbox"
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="absolute top-full left-0 mt-2 w-full bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 overflow-hidden max-h-64 overflow-y-auto"
                                                    >
                                                        <button
                                                            type="button"
                                                            role="option"
                                                            aria-selected={zoneId === null}
                                                            onClick={() => {
                                                                setZoneId(null);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors
                                                            ${zoneId === null ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                                        >
                                                            자동 배정 (좌표 기반)
                                                        </button>
                                                        {zones.map((zone) => (
                                                            <button
                                                                key={zone.zoneId}
                                                                type="button"
                                                                role="option"
                                                                aria-selected={zoneId === zone.zoneId}
                                                                onClick={() => {
                                                                    setZoneId(zone.zoneId);
                                                                    setIsDropdownOpen(false);
                                                                }}
                                                                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors
                                                                ${zoneId === zone.zoneId ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                                            >
                                                                {zone.zoneType === 'SUB' ? '  └ ' : ''}{zone.name}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* 설명 */}
                                <div>
                                    <label htmlFor="place-desc" className="block text-sm font-bold text-slate-700 mb-1.5">설명 (선택)</label>
                                    <textarea
                                        id="place-desc"
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                        placeholder="장소에 대한 설명을 입력하세요"
                                        rows={2}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50 resize-none"
                                    />
                                </div>

                                {/* 활성 상태 */}
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-sm font-bold text-slate-700">활성 상태</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsActive(!isActive)}
                                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isActive ? 'bg-orange-500' : 'bg-slate-300'}`}
                                        role="switch"
                                        aria-checked={isActive}
                                        aria-label="활성 상태 토글"
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isActive ? 'translate-x-5' : ''}`} />
                                    </button>
                                </div>

                                {/* 액션 버튼 */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                                    >
                                        취소
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!isFormValid || isSubmitting}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                                    >
                                        {isSubmitting && (
                                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        )}
                                        {isSubmitting ? '저장 중...' : mode === 'create' ? '추가' : '저장'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
