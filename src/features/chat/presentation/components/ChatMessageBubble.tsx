'use client';

import Image from 'next/image';
import type { ChatMessageBubbleProps } from '@/features/chat/presentation/types/ChatMessageBubbleProps';

const EMOTION_LABEL: Record<string, string> = {
    GUIDING: '안내',
    NEUTRAL: '일반',
    HAPPY: '기쁨',
    CURIOUS: '호기심',
    SORRY: '사과',
};

const CATEGORY_LABEL: Record<string, string> = {
    DIRECTION: '길안내',
    INFO: '정보',
    RECOMMENDATION: '추천',
    GREETING: '인사',
    UNKNOWN: '기타',
};

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
    const isUser = message.role === 'user';
    const { metadata } = message;

    return (
        <div className={`flex items-end gap-2 mb-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {!isUser && (
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-orange-500 text-xs font-bold">
                    AI
                </div>
            )}

            <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                    className={`
                        px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words
                        ${isUser
                            ? 'bg-orange-500 text-white rounded-br-sm'
                            : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm shadow-sm'
                        }
                    `}
                >
                    {message.content}
                </div>

                {!isUser && metadata && (
                    <>
                        {metadata.imageUrl && (
                            <div className="relative w-full h-32 rounded-xl overflow-hidden mt-1">
                                <Image
                                    src={metadata.imageUrl}
                                    alt={metadata.placeName ?? '장소 이미지'}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div className="flex flex-wrap gap-1 mt-0.5">
                            {metadata.emotion && (
                                <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-xs border border-orange-100">
                                    {EMOTION_LABEL[metadata.emotion] ?? metadata.emotion}
                                </span>
                            )}
                            {metadata.category && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 text-xs border border-slate-200">
                                    {CATEGORY_LABEL[metadata.category] ?? metadata.category}
                                </span>
                            )}
                            {metadata.placeName && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs border border-blue-100">
                                    📍 {metadata.placeName}
                                </span>
                            )}
                        </div>
                    </>
                )}

                <span className="text-[10px] text-slate-400 px-1">
                    {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </span>
            </div>
        </div>
    );
}
