'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineDeviceTablet, HiOutlineChevronDown } from 'react-icons/hi2';
import type { ChatDeviceSelectorProps } from '@/features/chat/presentation/types/ChatDeviceSelectorProps';

export function ChatDeviceSelector({
    devices,
    selectedDeviceId,
    onSelectDevice,
}: ChatDeviceSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedDevice = devices.find((device) => device.deviceId === selectedDeviceId);

    const handleSelectDevice = (deviceId: string) => {
        onSelectDevice(deviceId);
        setIsOpen(false);
    };

    if (devices.length === 0) {
        return (
            <span className="flex items-center gap-1 text-xs text-slate-400">
                <HiOutlineDeviceTablet className="w-3.5 h-3.5 shrink-0" />
                디바이스 없음
            </span>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen((previous) => !previous)}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-orange-300 px-2.5 py-1.5 rounded-xl text-slate-700 transition-all group"
            >
                <HiOutlineDeviceTablet className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="text-xs font-semibold max-w-[120px] truncate">
                    {selectedDevice ? selectedDevice.locationName : '디바이스 선택'}
                </span>
                <HiOutlineChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-[115]"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-2xl py-1.5 z-[120] shadow-xl overflow-hidden border border-slate-100"
                        >
                            <div className="px-3.5 py-2 mb-0.5 border-b border-slate-100">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                                    키오스크 선택
                                </p>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                                {devices.map((device) => (
                                    <button
                                        key={device.deviceId}
                                        onClick={() => handleSelectDevice(device.deviceId)}
                                        className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold transition-all
                                            ${selectedDeviceId === device.deviceId
                                                ? 'bg-orange-50 text-orange-600'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <span className="block truncate">{device.locationName}</span>
                                        <span className="block text-[10px] font-normal text-slate-400 mt-0.5 truncate">
                                            {device.deviceId}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
