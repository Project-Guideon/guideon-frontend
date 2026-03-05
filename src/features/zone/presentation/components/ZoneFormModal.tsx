'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark, HiOutlineMap } from 'react-icons/hi2';
import type { Zone, CreateZoneRequest, UpdateZoneRequest, GeoJsonPolygon } from '@/features/zone/domain/entities/Zone';

interface ZoneFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    editTarget: Zone | null;
    parentZones: Zone[];
    /** 지도에서 그린 폴리곤 좌표 (create 모드에서 사용) */
    drawnPolygon: { lat: number; lng: number }[];
    onClose: () => void;
    onSubmit: (request: CreateZoneRequest | UpdateZoneRequest) => void;
}

/** 이름 기반 자동 코드 생성 (한글 → 영문 약어) */
function generateZoneCode(name: string, zoneType: 'INNER' | 'SUB'): string {
    const prefix = zoneType === 'INNER' ? 'INNER' : 'SUB';
    const suffix = name.replace(/\s/g, '_').toUpperCase().slice(0, 6);
    const random = Math.floor(Math.random() * 100);
    return `${prefix}_${suffix}_${random}`;
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

    const derivedZoneType = parentZoneId !== null ? 'SUB' : 'INNER';

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (mode === 'create') {
            const code = generateZoneCode(name, derivedZoneType);
            // drawnPolygon → GeoJSON 변환 (닫힘 보장)
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
            onSubmit(request);
        } else {
            const request: UpdateZoneRequest = { name };
            onSubmit(request);
        }
        onClose();
    };

    const isFormValid = name.trim().length > 0 && (mode === 'edit' || drawnPolygon.length >= 3);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
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
                                    <select
                                        id="parent-zone"
                                        value={parentZoneId ?? ''}
                                        onChange={(event) => setParentZoneId(event.target.value ? Number(event.target.value) : null)}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                                    >
                                        <option value="">없음 (대구역으로 생성)</option>
                                        {parentZones.map((zone) => (
                                            <option key={zone.zoneId} value={zone.zoneId}>{zone.name}</option>
                                        ))}
                                    </select>
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
                                    disabled={!isFormValid}
                                    className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
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
