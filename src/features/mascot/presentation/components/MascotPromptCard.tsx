'use client';

import { useState } from 'react';
import { HiOutlineCpuChip, HiOutlinePencilSquare, HiChevronDown, HiChevronUp } from 'react-icons/hi2';
import type { Mascot } from '@/features/mascot/domain/entities/Mascot';

interface MascotPromptCardProps {
    mascot: Mascot;
    onEdit: () => void;
}

/**
 * 시스템 프롬프트 & 프롬프트 설정 카드
 */
export function MascotPromptCard({ mascot, onEdit }: MascotPromptCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const promptConfigEntries = mascot.promptConfig ? Object.entries(mascot.promptConfig) : [];

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                        <HiOutlineCpuChip className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">AI 프롬프트</h3>
                        <p className="text-xs text-slate-400">LLM 시스템 프롬프트 및 설정</p>
                    </div>
                </div>
                <button
                    onClick={onEdit}
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-orange-600 transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-orange-50"
                >
                    <HiOutlinePencilSquare className="w-4 h-4" />
                    수정
                </button>
            </div>

            {/* 시스템 프롬프트 */}
            <div className="mb-4">
                <p className="text-xs font-bold text-slate-400 mb-2">시스템 프롬프트</p>
                <div className="bg-slate-50 rounded-xl p-4">
                    <p className={`text-sm text-slate-700 leading-relaxed whitespace-pre-wrap ${
                        !isExpanded ? 'line-clamp-4' : ''
                    }`}>
                        {mascot.systemPrompt}
                    </p>
                    {mascot.systemPrompt.length > 200 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-1 mt-2 text-xs font-medium text-orange-500 hover:text-orange-600 transition-colors"
                        >
                            {isExpanded ? (
                                <>접기 <HiChevronUp className="w-3.5 h-3.5" /></>
                            ) : (
                                <>더보기 <HiChevronDown className="w-3.5 h-3.5" /></>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* 프롬프트 설정 */}
            {promptConfigEntries.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-slate-400 mb-2">프롬프트 설정</p>
                    <div className="grid grid-cols-1 gap-2">
                        {promptConfigEntries.map(([key, value]) => (
                            <div key={key} className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
                                <span className="text-xs font-medium text-slate-500">{key}</span>
                                <span className="text-sm text-slate-700">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
