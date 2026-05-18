'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineBuildingOffice2, HiOutlineChevronDown } from 'react-icons/hi2';
import type { ChatSiteSelectorProps } from '@/features/chat/presentation/types/ChatSiteSelectorProps';

export function ChatSiteSelector({
    sites,
    currentSiteId,
    onSelectSite,
}: ChatSiteSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const currentSite = sites.find((site) => site.siteId === currentSiteId);

    const handleSelectSite = (siteId: number) => {
        onSelectSite(siteId);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen((previous) => !previous)}
                className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 hover:border-orange-400 px-2.5 py-1.5 rounded-xl text-orange-700 transition-all group"
            >
                <HiOutlineBuildingOffice2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="text-xs font-bold max-w-[100px] truncate">
                    {currentSite ? currentSite.name : '관광지 선택'}
                </span>
                <HiOutlineChevronDown
                    className={`w-3.5 h-3.5 text-orange-400 group-hover:text-orange-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
                                    관광지 전환
                                </p>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {sites.map((site) => (
                                    <button
                                        key={site.siteId}
                                        onClick={() => handleSelectSite(site.siteId)}
                                        className={`w-full text-left px-3.5 py-2.5 text-xs font-bold transition-all flex items-center justify-between gap-2
                                            ${currentSiteId === site.siteId
                                                ? 'bg-orange-50 text-orange-600'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <span className="truncate">{site.name}</span>
                                        {!site.isActive && (
                                            <span className="text-[10px] font-normal text-slate-400 shrink-0">
                                                비활성
                                            </span>
                                        )}
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
