'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineXMark,
    HiOutlineDevicePhoneMobile,
    HiOutlineMapPin,
    HiOutlineChevronDown,
    HiOutlineSignal,
} from 'react-icons/hi2';
import type { Device, CreateDeviceRequest, UpdateDeviceRequest } from '@/features/device/domain/entities/Device';
import type { Zone } from '@/features/zone/domain/entities/Zone';

interface DeviceFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    editTarget: Device | null;
    zones: Zone[];
    /** 메인 지도에서 클릭한 좌표 (create 모드) */
    selectedCoords: { lat: number; lng: number };
    onClose: () => void;
    onSubmit: (request: CreateDeviceRequest | UpdateDeviceRequest) => void | Promise<void>;
}

/** 페어링 코드 유효성 정규식: 영문 대문자 + 숫자 6자리 */
const PAIRING_CODE_REGEX = /^[A-Z0-9]{6}$/;

/**
 * 디바이스 등록/수정 모달
 *
 * - 등록 시: 키오스크 화면의 6자리 페어링 코드를 입력하여 매칭
 * - plainToken은 키오스크가 직접 수령하므로 토큰 표시 화면 없음
 * - PlaceFormModal과 동일한 UI 패턴
 */
export function DeviceFormModal({
    isOpen,
    mode,
    editTarget,
    zones,
    selectedCoords,
    onClose,
    onSubmit,
}: DeviceFormModalProps) {
    const [pairingCode, setPairingCode] = useState('');
    const [deviceId, setDeviceId] = useState(mode === 'edit' && editTarget ? editTarget.deviceId : '');
    const [locationName, setLocationName] = useState(mode === 'edit' && editTarget ? editTarget.locationName : '');
    const [zoneId, setZoneId] = useState<number | null>(mode === 'edit' && editTarget ? editTarget.zoneId : null);
    const [isActive, setIsActive] = useState(mode === 'edit' && editTarget ? editTarget.isActive : true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const latitude = mode === 'edit' && editTarget ? editTarget.latitude : selectedCoords.lat;
    const longitude = mode === 'edit' && editTarget ? editTarget.longitude : selectedCoords.lng;

    /** 페어링 코드 입력 핸들러 — 자동 대문자 변환 + 6자 제한 */
    const handlePairingCodeChange = (value: string) => {
        const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        setPairingCode(sanitized);
    };

    const isPairingCodeValid = PAIRING_CODE_REGEX.test(pairingCode);

    const isFormValid = mode === 'create'
        ? isPairingCodeValid && deviceId.trim().length > 0 && locationName.trim().length > 0
        : locationName.trim().length > 0;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            if (mode === 'create') {
                const request: CreateDeviceRequest = {
                    pairingCode,
                    deviceId: deviceId.trim(),
                    locationName: locationName.trim(),
                    latitude,
                    longitude,
                    zoneSource: zoneId != null ? 'MANUAL' : 'AUTO',
                    zoneId: zoneId ?? undefined,
                };
                await onSubmit(request);
            } else {
                const request: UpdateDeviceRequest = {
                    locationName: locationName.trim(),
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
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <HiOutlineDevicePhoneMobile className="w-5 h-5 text-violet-500" />
                                    {mode === 'create' ? '디바이스 페어링' : '디바이스 수정'}
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
                                    <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center text-white shrink-0">
                                            <HiOutlineMapPin className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-violet-600 mb-0.5">선택된 위치</p>
                                            <p className="text-[11px] font-medium text-violet-800">
                                                {latitude.toFixed(6)}, {longitude.toFixed(6)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* 페어링 코드 (등록 모드 전용) */}
                                {mode === 'create' && (
                                    <div>
                                        <label htmlFor="pairing-code" className="block text-sm font-bold text-slate-700 mb-1.5">
                                            페어링 코드 *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-500">
                                                <HiOutlineSignal className="w-4.5 h-4.5" />
                                            </div>
                                            <input
                                                id="pairing-code"
                                                type="text"
                                                value={pairingCode}
                                                onChange={(event) => handlePairingCodeChange(event.target.value)}
                                                placeholder="예: A3F29K"
                                                maxLength={6}
                                                autoFocus
                                                autoComplete="off"
                                                spellCheck={false}
                                                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-base font-mono font-bold tracking-[0.3em] text-center text-slate-800 placeholder:text-slate-300 placeholder:tracking-[0.15em] placeholder:font-medium outline-none transition-all
                                                    ${pairingCode.length > 0 && !isPairingCodeValid
                                                        ? 'border-amber-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-50'
                                                        : isPairingCodeValid
                                                            ? 'border-teal-300 focus:border-teal-400 focus:ring-4 focus:ring-teal-50'
                                                            : 'border-slate-200 hover:border-teal-300 focus:border-teal-400 focus:ring-4 focus:ring-teal-50'
                                                    }`}
                                            />
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-400 mt-1.5 leading-relaxed">
                                            키오스크 화면에 표시된 6자리 코드를 입력하세요
                                        </p>
                                    </div>
                                )}

                                {/* 디바이스 ID */}
                                <div>
                                    <label htmlFor="device-id" className="block text-sm font-bold text-slate-700 mb-1.5">디바이스 ID *</label>
                                    <input
                                        id="device-id"
                                        type="text"
                                        value={deviceId}
                                        onChange={(event) => setDeviceId(event.target.value)}
                                        placeholder="예: KIOSK-MAIN-01"
                                        maxLength={50}
                                        disabled={mode === 'edit'}
                                        className={`w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all hover:border-violet-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-50 ${
                                            mode === 'edit' ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''
                                        }`}
                                    />
                                    {mode === 'edit' && (
                                        <p className="text-[10px] text-slate-400 mt-1">디바이스 ID는 변경할 수 없습니다</p>
                                    )}
                                </div>

                                {/* 설치 위치명 */}
                                <div>
                                    <label htmlFor="device-location" className="block text-sm font-bold text-slate-700 mb-1.5">설치 위치명 *</label>
                                    <input
                                        id="device-location"
                                        type="text"
                                        value={locationName}
                                        onChange={(event) => setLocationName(event.target.value)}
                                        placeholder="예: 정문 안내소"
                                        maxLength={100}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all hover:border-violet-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-50"
                                    />
                                </div>

                                {/* 구역 선택 */}
                                <div>
                                    <label htmlFor="device-zone" className="block text-sm font-bold text-slate-700 mb-1.5">소속 구역 (선택)</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            aria-haspopup="listbox"
                                            aria-expanded={isDropdownOpen}
                                            aria-controls="device-zone-options"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none transition-all hover:border-violet-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-50"
                                        >
                                            <span className={zoneId != null ? 'text-slate-800' : 'text-slate-400'}>
                                                {zoneId === null
                                                    ? '자동 배정 (좌표 기반)'
                                                    : zones.find((zone) => zone.zoneId === zoneId)?.name ?? '알 수 없음'}
                                            </span>
                                            <HiOutlineChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                                                    <motion.div
                                                        id="device-zone-options"
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
                                                            onClick={() => { setZoneId(null); setIsDropdownOpen(false); }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors
                                                                ${zoneId === null ? 'bg-violet-50 text-violet-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                                        >
                                                            자동 배정 (좌표 기반)
                                                        </button>
                                                        {zones.map((zone) => (
                                                            <button
                                                                key={zone.zoneId}
                                                                type="button"
                                                                role="option"
                                                                aria-selected={zoneId === zone.zoneId}
                                                                onClick={() => { setZoneId(zone.zoneId); setIsDropdownOpen(false); }}
                                                                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors
                                                                    ${zoneId === zone.zoneId ? 'bg-violet-50 text-violet-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
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

                                {/* 활성 상태 토글 (수정 모드 전용) */}
                                {mode === 'edit' && (
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-sm font-bold text-slate-700">활성 상태</span>
                                        <button
                                            type="button"
                                            onClick={() => setIsActive(!isActive)}
                                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isActive ? 'bg-violet-500' : 'bg-slate-300'}`}
                                            role="switch"
                                            aria-checked={isActive}
                                            aria-label="활성 상태 토글"
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isActive ? 'translate-x-5' : ''}`} />
                                        </button>
                                    </div>
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
                                        disabled={!isFormValid || isSubmitting}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-bold hover:bg-violet-600 shadow-lg shadow-violet-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                                    >
                                        {isSubmitting && (
                                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        )}
                                        {isSubmitting ? '저장 중...' : mode === 'create' ? '페어링' : '저장'}
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
