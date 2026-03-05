'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark, HiOutlineMap } from 'react-icons/hi2';
import type { Zone, ZoneType, CreateZoneRequest, UpdateZoneRequest } from '@/features/zone/domain/entities/Zone';

interface ZoneFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    editTarget: Zone | null;
    parentZones: Zone[];
    onClose: () => void;
    onSubmit: (request: CreateZoneRequest | UpdateZoneRequest) => void;
}

export function ZoneFormModal({ isOpen, mode, editTarget, parentZones, onClose, onSubmit }: ZoneFormModalProps) {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [zoneType, setZoneType] = useState<ZoneType>('INNER');
    const [parentZoneId, setParentZoneId] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && editTarget) {
                setName(editTarget.name);
                setCode(editTarget.code);
                setZoneType(editTarget.zoneType);
                setParentZoneId(editTarget.parentZoneId);
            } else {
                setName('');
                setCode('');
                setZoneType('INNER');
                setParentZoneId(null);
            }
        }
    }, [isOpen, mode, editTarget]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (mode === 'create') {
            const request: CreateZoneRequest = {
                name,
                code,
                zoneType,
                parentZoneId: zoneType === 'SUB' ? parentZoneId : null,
                areaGeojson: {
                    type: 'Polygon',
                    coordinates: [[[126.976, 37.578], [126.978, 37.578], [126.978, 37.580], [126.976, 37.580], [126.976, 37.578]]],
                },
            };
            onSubmit(request);
        } else {
            const request: UpdateZoneRequest = { name, code };
            onSubmit(request);
        }
        onClose();
    };

    const isFormValid = name.trim().length > 0 && code.trim().length > 0 && (zoneType === 'INNER' || parentZoneId !== null);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* 백드롭 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    {/* 모달 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* 헤더 */}
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

                        {/* 폼 */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="zone-name" className="block text-sm font-bold text-slate-700 mb-1.5">구역명 *</label>
                                <input
                                    id="zone-name"
                                    type="text"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    placeholder="예: 근정전 권역"
                                    maxLength={50}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                                />
                            </div>

                            <div>
                                <label htmlFor="zone-code" className="block text-sm font-bold text-slate-700 mb-1.5">구역 코드 *</label>
                                <input
                                    id="zone-code"
                                    type="text"
                                    value={code}
                                    onChange={(event) => setCode(event.target.value)}
                                    placeholder="예: INNER_A"
                                    maxLength={50}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                                />
                            </div>

                            {mode === 'create' && (
                                <>
                                    <div>
                                        <label htmlFor="zone-type" className="block text-sm font-bold text-slate-700 mb-1.5">구역 타입 *</label>
                                        <div className="flex gap-2">
                                            {(['INNER', 'SUB'] as ZoneType[]).map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => {
                                                        setZoneType(type);
                                                        if (type === 'INNER') setParentZoneId(null);
                                                    }}
                                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border
                                                        ${zoneType === type
                                                            ? type === 'INNER'
                                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                                : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {type === 'INNER' ? '🏛 INNER (대구역)' : '📍 SUB (하위)'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {zoneType === 'SUB' && (
                                        <div>
                                            <label htmlFor="parent-zone" className="block text-sm font-bold text-slate-700 mb-1.5">상위 구역 *</label>
                                            <select
                                                id="parent-zone"
                                                value={parentZoneId ?? ''}
                                                onChange={(event) => setParentZoneId(event.target.value ? Number(event.target.value) : null)}
                                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                                            >
                                                <option value="">상위 구역 선택...</option>
                                                {parentZones.map((zone) => (
                                                    <option key={zone.zoneId} value={zone.zoneId}>{zone.name} ({zone.code})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </>
                            )}

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
