'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark, HiOutlineMap, HiOutlineChevronDown } from 'react-icons/hi2';
import type { Zone, CreateZoneRequest, UpdateZoneRequest, GeoJsonPolygon } from '@/features/zone/domain/entities/Zone';

interface ZoneFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    editTarget: Zone | null;
    parentZones: Zone[];
    /** 지도에서 그린 폴리곤 좌표 (create 모드에서 사용) */
    drawnPolygon: { lat: number; lng: number }[];
    onClose: () => void;
    onSubmit: (request: CreateZoneRequest | UpdateZoneRequest) => void | Promise<void>;
}

function generateZoneCode(name: string, zoneType: 'INNER' | 'SUB'): string {
    const prefix = zoneType === 'INNER' ? 'INNER' : 'SUB';
    const suffix = name.replace(/\s/g, '_').toUpperCase().slice(0, 6);
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().split('-')[0].toUpperCase()
        : Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${suffix}_${uniqueId}`;
}

/**
 * 구역 생성/수정 모달 (경량)
 *
 * - 지도에서 폴리곤을 미리 그린 후 이 모달이 열림
 * - 코드는 이름 기반 자동 생성
 * - 상위 구역 선택 시 자동 SUB 결정
 */
export function ZoneFormModal({ isOpen, mode, editTarget, parentZones, drawnPolygon, onClose, onSubmit }: ZoneFormModalProps) {
    const [name, setName] = useState(mode === 'edit' && editTarget ? editTarget.name : '');
    const [parentZoneId, setParentZoneId] = useState<number | null>(
        mode === 'edit' && editTarget ? editTarget.parentZoneId : null,
    );
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isDropdownOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsDropdownOpen(true);
            }
            return;
        }

        const optionsCount = parentZones.length + 1; // 1 for null
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev + 1) % optionsCount);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev - 1 + optionsCount) % optionsCount);
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (highlightedIndex === 0) setParentZoneId(null);
            else setParentZoneId(parentZones[highlightedIndex - 1].zoneId);
            setIsDropdownOpen(false);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsDropdownOpen(false);
        }
    };

    const derivedZoneType = parentZoneId !== null ? 'SUB' : 'INNER';

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            if (mode === 'create') {
                const code = generateZoneCode(name, derivedZoneType);
                const coords = drawnPolygon.map((p) => [p.lng, p.lat]);
                if (coords.length > 0 && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
                    coords.push([...coords[0]]);
                }
                const areaGeojson: GeoJsonPolygon = {
                    type: 'Polygon',
                    coordinates: [coords],
                };
                const request: CreateZoneRequest = {
                    name,
                    code,
                    zoneType: derivedZoneType,
                    parentZoneId: derivedZoneType === 'SUB' ? parentZoneId : null,
                    areaGeojson,
                };
                await onSubmit(request);
            } else {
                const request: UpdateZoneRequest = { name };
                await onSubmit(request);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = name.trim().length > 0 && (mode === 'edit' || drawnPolygon.length >= 3);

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
                            className="relative w-full max-w-md text-left bg-white rounded-2xl shadow-2xl flex flex-col"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <HiOutlineMap className="w-5 h-5 text-blue-500" />
                                    {mode === 'create' ? '구역 추가' : '구역 수정'}
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
                                {/* 영역 정보 (create 모드) */}
                                {mode === 'create' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                                        <p className="text-xs font-bold text-blue-600 mb-0.5">지도에서 그린 영역</p>
                                        <p className="text-sm font-medium text-blue-800">{drawnPolygon.length}개의 꼭짓점으로 구성</p>
                                    </div>
                                )}

                                {/* 구역명 */}
                                <div>
                                    <label htmlFor="zone-name" className="block text-sm font-bold text-slate-700 mb-1.5">구역명 *</label>
                                    <input
                                        id="zone-name"
                                        type="text"
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        placeholder="예: 근정전 권역"
                                        maxLength={50}
                                        autoFocus
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                                    />
                                </div>

                                {/* 상위 구역 — 선택하면 자동 SUB */}
                                {mode === 'create' && (
                                    <div>
                                        <label htmlFor="parent-zone" className="block text-sm font-bold text-slate-700 mb-1.5">상위 구역 (선택)</label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                aria-haspopup="listbox"
                                                aria-expanded={isDropdownOpen}
                                                aria-controls="zone-parent-options"
                                                onKeyDown={handleKeyDown}
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50 focus:outline-none"
                                            >
                                                <span className={parentZoneId ? 'text-slate-800' : 'text-slate-400'}>
                                                    {parentZoneId === null
                                                        ? '없음 (대구역으로 생성)'
                                                        : parentZones.find(z => z.zoneId === parentZoneId)?.name ?? '알 수 없음'}
                                                </span>
                                                <HiOutlineChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            <AnimatePresence>
                                                {isDropdownOpen && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                                                        <motion.div
                                                            id="zone-parent-options"
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
                                                                aria-selected={parentZoneId === null}
                                                                onClick={() => {
                                                                    setParentZoneId(null);
                                                                    setIsDropdownOpen(false);
                                                                }}
                                                                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors outline-none
                                                                ${parentZoneId === null || highlightedIndex === 0 ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                                            >
                                                                없음 (대구역으로 생성)
                                                            </button>
                                                            {parentZones.map((zone, index) => (
                                                                <button
                                                                    key={zone.zoneId}
                                                                    type="button"
                                                                    role="option"
                                                                    aria-selected={parentZoneId === zone.zoneId}
                                                                    onClick={() => {
                                                                        setParentZoneId(zone.zoneId);
                                                                        setIsDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors outline-none
                                                                    ${parentZoneId === zone.zoneId || highlightedIndex === index + 1 ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                                                >
                                                                    {zone.name}
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <p className="mt-1.5 text-xs text-slate-400 font-medium">
                                            {derivedZoneType === 'INNER'
                                                ? '대구역(INNER)으로 생성됩니다'
                                                : '하위구역(SUB)으로 생성됩니다'
                                            }
                                        </p>
                                    </div>
                                )}

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
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
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
