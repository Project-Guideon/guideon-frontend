'use client';

import { motion } from 'framer-motion';
import { HiXMark, HiOutlineDocumentText, HiOutlineClock, HiOutlineIdentification, HiOutlineGlobeAlt } from 'react-icons/hi2';
import type { AuditLogEntry } from '@/features/auditLog/domain/entities/AuditLogEntry';

interface AuditLogDetailPanelProps {
    log: AuditLogEntry | null;
    onClose: () => void;
}

export function AuditLogDetailPanel({ log, onClose }: AuditLogDetailPanelProps) {
    if (!log) return null;

    const statusStyles = {
        success: {
            bar: 'bg-green-500',
            icon: 'text-green-500',
            bg: 'bg-green-50',
            buttonHover: 'hover:bg-green-600',
            shadow: 'shadow-green-100'
        },
        warning: {
            bar: 'bg-orange-500',
            icon: 'text-orange-500',
            bg: 'bg-orange-50',
            buttonHover: 'hover:bg-orange-600',
            shadow: 'shadow-orange-100'
        },
        error: {
            bar: 'bg-red-500',
            icon: 'text-red-500',
            bg: 'bg-red-50',
            buttonHover: 'hover:bg-red-600',
            shadow: 'shadow-red-100'
        },
    };
    const currentStyle = statusStyles[log.status];
    const typeIconColors = {
        SYSTEM: 'text-slate-500', // 시스템: 무채색/슬레이트
        USER: 'text-blue-500',   // 사용자: 블루
        DEVICE: 'text-purple-500', // 디바이스: 퍼플
    };
    const currentTypeColor = typeIconColors[log.type];

    return (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
            {/* 배경 흐림 처리 (오버레이) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* 모달 본체 */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* 상단 오렌지색 헤더 장식 */}
                <div className={`h-2 w-full ${currentStyle.bar}`} />

                <div className="p-8">
                    {/* 헤더 섹션 */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border 
                                    ${log.status === 'success' ? 'bg-green-50 border-green-100 text-green-600' : 
                                      log.status === 'warning' ? 'bg-orange-50 border-orange-100 text-orange-600' : 
                                      'bg-red-50 border-red-100 text-red-600'}`}
                                >
                                    {log.status.toUpperCase()}
                                </span>
                                <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                                    <HiOutlineClock className="w-3.5 h-3.5" /> {log.time}
                                </span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                {log.action}
                            </h3>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                        >
                            <HiXMark className="w-6 h-6" />
                        </button>
                    </div>

                    {/* 로그 상세 내용 */}
                    <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                        <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
                            "{log.message}"
                        </p>
                    </div>

                    {/* 정보 그리드 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <HiOutlineGlobeAlt className={`w-5 h-5 ${currentStyle.icon} mb-2`} />
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">발생 위치</p>
                            <p className="text-sm font-bold text-slate-700">{log.site || '-'}</p>
                        </div>
                        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <HiOutlineIdentification className={`w-5 h-5 ${currentStyle.icon} mb-2`} />
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">대상 식별자</p>
                            <p className="text-sm font-bold text-slate-700">{log.target}</p>
                        </div>
                        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm col-span-2">
                            <div className="flex items-center gap-3">
                                <HiOutlineDocumentText className={`w-5 h-5 ${currentTypeColor} mb-2`} />
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">시스템 로그 유형</p>
                                    <p className={`text-sm font-bold ${currentTypeColor}`}>{log.type}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 하단 버튼 */}
                    <button 
                        onClick={onClose}
                        className={`w-full mt-8 py-4 rounded-2xl font-bold transition-all duration-200 
                            bg-slate-100 text-slate-500 
                            ${currentStyle.buttonHover} hover:text-white hover:shadow-lg ${currentStyle.shadow}
                            active:scale-[0.98] flex items-center justify-center`}
                    >
                        확인
                    </button>
                </div>
            </motion.div>
        </div>
    );
}