'use client';

import { HiOutlineSpeakerWave, HiOutlinePencilSquare } from 'react-icons/hi2';
import type { Mascot } from '@/features/mascot/domain/entities/Mascot';
import { TTS_VOICE_OPTIONS } from '@/features/mascot/domain/entities/Mascot';

interface MascotTtsCardProps {
    mascot: Mascot;
    onEdit: () => void;
}

/**
 * TTS 음성 설정 카드
 */
export function MascotTtsCard({ mascot, onEdit }: MascotTtsCardProps) {
    const voiceLabel = TTS_VOICE_OPTIONS.find((option) => option.value === mascot.ttsVoiceId)?.label
        ?? mascot.ttsVoiceId;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                        <HiOutlineSpeakerWave className="w-5 h-5 text-sky-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">TTS 음성</h3>
                        <p className="text-xs text-slate-400">텍스트 음성 변환 설정</p>
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

            {/* 음성 정보 */}
            <div className="space-y-3">
                <div className="bg-slate-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-slate-400 mb-0.5">음성</p>
                    <p className="text-sm font-medium text-slate-700">{voiceLabel}</p>
                </div>

                {mascot.ttsVoiceJson && (
                    <div className="grid grid-cols-2 gap-3">
                        {mascot.ttsVoiceJson.speed !== undefined && (
                            <div className="bg-slate-50 rounded-xl px-4 py-3">
                                <p className="text-xs text-slate-400 mb-0.5">속도</p>
                                <p className="text-sm font-medium text-slate-700">{mascot.ttsVoiceJson.speed}x</p>
                            </div>
                        )}
                        {mascot.ttsVoiceJson.pitch !== undefined && (
                            <div className="bg-slate-50 rounded-xl px-4 py-3">
                                <p className="text-xs text-slate-400 mb-0.5">피치</p>
                                <p className="text-sm font-medium text-slate-700">{mascot.ttsVoiceJson.pitch}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
