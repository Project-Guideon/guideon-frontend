'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark, HiOutlineMapPin } from 'react-icons/hi2';
import type { Place, PlaceCategory, CreatePlaceRequest, UpdatePlaceRequest } from '@/features/place/domain/entities/Place';
import { PLACE_CATEGORY_META } from '@/features/place/domain/entities/Place';
import type { Zone } from '@/features/zone/domain/entities/Zone';

const CATEGORIES = Object.entries(PLACE_CATEGORY_META) as [PlaceCategory, { label: string; emoji: string; color: string }][];

interface PlaceFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    editTarget: Place | null;
    zones: Zone[];
    onClose: () => void;
    onSubmit: (request: CreatePlaceRequest | UpdatePlaceRequest) => void;
}

export function PlaceFormModal({ isOpen, mode, editTarget, zones, onClose, onSubmit }: PlaceFormModalProps) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<PlaceCategory>('ATTRACTION');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [description, setDescription] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [zoneId, setZoneId] = useState<number | null>(null);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && editTarget) {
                setName(editTarget.name);
                setCategory(editTarget.category);
                setLatitude(String(editTarget.latitude));
                setLongitude(String(editTarget.longitude));
                setDescription(editTarget.description ?? '');
                setNameEn(editTarget.nameJson?.en ?? '');
                setZoneId(editTarget.zoneId);
                setIsActive(editTarget.isActive);
            } else {
                setName('');
                setCategory('ATTRACTION');
                setLatitude('37.5796');
                setLongitude('126.9770');
                setDescription('');
                setNameEn('');
                setZoneId(null);
                setIsActive(true);
            }
        }
    }, [isOpen, mode, editTarget]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const nameJson = nameEn ? { en: nameEn } : undefined;

        if (mode === 'create') {
            const request: CreatePlaceRequest = {
                name,
                category,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                description: description || undefined,
                nameJson,
                zoneSource: zoneId ? 'MANUAL' : 'AUTO',
                zoneId: zoneId ?? undefined,
                isActive,
            };
            onSubmit(request);
        } else {
            const request: UpdatePlaceRequest = {
                name,
                category,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                description: description || undefined,
                nameJson,
                isActive,
            };
            onSubmit(request);
        }
        onClose();
    };

    const isFormValid = name.trim().length > 0 && latitude.length > 0 && longitude.length > 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* 헤더 */}
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

                        {/* 폼 */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
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

                            {/* 카테고리 */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">카테고리 *</label>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {CATEGORIES.map(([key, meta]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setCategory(key)}
                                            className={`flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-bold transition-all border
                                                ${category === key
                                                    ? 'border-orange-300 bg-orange-50 text-orange-700 shadow-sm'
                                                    : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className="text-base">{meta.emoji}</span>
                                            <span>{meta.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 좌표 */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="place-lat" className="block text-sm font-bold text-slate-700 mb-1.5">위도 *</label>
                                    <input
                                        id="place-lat"
                                        type="number"
                                        step="any"
                                        value={latitude}
                                        onChange={(event) => setLatitude(event.target.value)}
                                        placeholder="37.5796"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="place-lng" className="block text-sm font-bold text-slate-700 mb-1.5">경도 *</label>
                                    <input
                                        id="place-lng"
                                        type="number"
                                        step="any"
                                        value={longitude}
                                        onChange={(event) => setLongitude(event.target.value)}
                                        placeholder="126.9770"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                                    />
                                </div>
                            </div>

                            {/* 구역 선택 */}
                            <div>
                                <label htmlFor="place-zone" className="block text-sm font-bold text-slate-700 mb-1.5">소속 구역 (선택)</label>
                                <select
                                    id="place-zone"
                                    value={zoneId ?? ''}
                                    onChange={(event) => setZoneId(event.target.value ? Number(event.target.value) : null)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                                >
                                    <option value="">자동 배정 (좌표 기반)</option>
                                    {zones.map((zone) => (
                                        <option key={zone.zoneId} value={zone.zoneId}>
                                            {zone.zoneType === 'SUB' ? '  └ ' : ''}{zone.name} ({zone.code})
                                        </option>
                                    ))}
                                </select>
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
                                    disabled={!isFormValid}
                                    className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                                >
                                    {mode === 'create' ? '추가' : '저장'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
