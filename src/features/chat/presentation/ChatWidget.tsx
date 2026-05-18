'use client';

import { useState } from 'react';
import { ChatFloatingButton } from './components/ChatFloatingButton';
import { ChatPanel } from './components/ChatPanel';

/** Admin 전역 AI 채팅 테스트 위젯 (FloatingButton + Panel 컨테이너) */
export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggleChat = () => {
        setIsOpen((previous) => !previous);
    };

    const handleCloseChat = () => {
        setIsOpen(false);
    };

    return (
        <>
            <ChatPanel isOpen={isOpen} onClose={handleCloseChat} />
            <ChatFloatingButton isOpen={isOpen} onToggle={handleToggleChat} />
        </>
    );
}
