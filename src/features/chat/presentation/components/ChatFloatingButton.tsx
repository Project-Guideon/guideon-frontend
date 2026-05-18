'use client';

import { HiOutlineChatBubbleLeftRight, HiOutlineXMark } from 'react-icons/hi2';
import type { ChatFloatingButtonProps } from '@/features/chat/presentation/types/ChatFloatingButtonProps';

/**
 * 관리자 전역 AI 채팅 테스트 진입 버튼 (Neumorphism 입체감 스타일)
 *
 * Plastic style: inset highlight + drop shadow
 * Metal style: conic-gradient 호버 전환으로 메탈릭 광택 표현
 */
export function ChatFloatingButton({ isOpen, onToggle }: ChatFloatingButtonProps) {
    return (
        <button
            onClick={onToggle}
            aria-label={isOpen ? 'AI 채팅 테스트 닫기' : 'AI 채팅 테스트 열기'}
            className="
                fixed bottom-6 right-6 z-[90]
                w-14 h-14 rounded-full
                flex items-center justify-center
                text-white
                transition-transform duration-200
                hover:scale-105 active:scale-95
                focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2
            "
            style={{
                background: isOpen
                    ? 'conic-gradient(from 225deg, #FF8A6B, #FF6B52, #E5503A, #FF6B52, #FF8A6B)'
                    : '#f97316',
                boxShadow: `
                    inset 0 2px 1px rgba(255, 255, 255, 1.0),
                    inset 0 -2px 1px rgba(0, 0, 0, 0.1),
                    0 8px 24px rgba(255, 107, 82, 0.4)
                `,
            }}
        >
            {isOpen ? (
                <HiOutlineXMark className="w-6 h-6" />
            ) : (
                <HiOutlineChatBubbleLeftRight className="w-6 h-6" />
            )}
        </button>
    );
}
