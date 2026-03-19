'use client';

import { HiOutlineSparkles, HiOutlineChatBubbleLeftRight, HiOutlinePencilSquare } from 'react-icons/hi2';
import type { Mascot } from '@/features/mascot/domain/entities/Mascot';

interface MascotInfoCardProps {
    mascot: Mascot;
    onEdit: () => void;
}

/**
 * 마스코트 기본 정보 카드
 * 이름, 인사말, 활성 상태 표시
 */
export function MascotInfoCard({ mascot, onEdit }: MascotInfoCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <HiOutlineSparkles className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">기본 정보</h3>
                        <p className="text-xs text-slate-400">마스코트 이름 및 인사말</p>
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

            {/* 내용 */}
            <div className="space-y-4">
                {/* 이름 + 상태 */}
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-slate-800">{mascot.name}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        mascot.isActive
                            ? 'bg-green-50 text-green-600'
                            : 'bg-slate-100 text-slate-400'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                            mascot.isActive ? 'bg-green-500' : 'bg-slate-300'
                        }`} />
                        {mascot.isActive ? '활성' : '비활성'}
                    </span>
                </div>

                {/* 인사말 */}
                <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-start gap-2.5">
                        <HiOutlineChatBubbleLeftRight className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-slate-400 mb-1">인사말</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{mascot.greetingMsg}</p>
                        </div>
                    </div>
                </div>

                {/* 메타 정보 */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl px-4 py-3">
                        <p className="text-xs text-slate-400 mb-0.5">모델 ID</p>
                        <p className="text-sm font-medium text-slate-700 truncate">{mascot.modelId}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-4 py-3">
                        <p className="text-xs text-slate-400 mb-0.5">기본 애니메이션</p>
                        <p className="text-sm font-medium text-slate-700">{mascot.defaultAnim}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
