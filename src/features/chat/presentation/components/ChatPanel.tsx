'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark, HiOutlinePaperAirplane, HiOutlineArrowPath } from 'react-icons/hi2';
import { useDevices } from '@/features/device/application/hooks/useDevices';
import { useAuth, useSiteContext } from '@/features/auth/application/hooks/useAuth';
import { useChatSession } from '@/features/chat/application/hooks/useChatSession';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatTypingIndicator } from './ChatTypingIndicator';
import { ChatDeviceSelector } from './ChatDeviceSelector';
import { ChatSiteSelector } from './ChatSiteSelector';
import type { ChatPanelProps } from '@/features/chat/presentation/types/ChatPanelProps';

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
    const [inputText, setInputText] = useState('');
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { isPlatformAdmin } = useAuth();
    const { sites, currentSiteId, setCurrentSite } = useSiteContext();
    const { filteredDevices } = useDevices();

    // 선택된 디바이스가 없으면 첫 번째 활성 디바이스를 기본값으로 사용
    const effectiveDeviceId = selectedDeviceId ?? filteredDevices[0]?.deviceId ?? null;
    const selectedDevice = filteredDevices.find((device) => device.deviceId === effectiveDeviceId) ?? null;
    const { messages, isPending, sendMessage, resetSession } = useChatSession(selectedDevice);

    // 사이트 변경 시 디바이스 선택 초기화
    const handleSelectSite = async (siteId: number) => {
        setCurrentSite(siteId);
        setSelectedDeviceId(null);
        await resetSession();
    };

    // 디바이스 변경 시 세션 리셋
    const handleSelectDevice = async (deviceId: string) => {
        setSelectedDeviceId(deviceId);
        await resetSession();
    };

    // 새 메시지 도착 시 스크롤 하단 이동
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isPending]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || isPending || !selectedDevice) return;
        const text = inputText;
        setInputText('');
        await sendMessage(text);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const handleCloseChat = async () => {
        await resetSession();
        onClose();
    };

    const handleResetSession = async () => {
        await resetSession();
    };

    const isReady = !!currentSiteId && !!selectedDevice;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-24 right-6 z-[110] w-[360px] h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
                >
                    {/* 헤더 */}
                    <div className="px-4 pt-3.5 pb-3 border-b border-slate-100 shrink-0 bg-white">
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-sm font-bold text-slate-800">AI 채팅 테스트</span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleResetSession}
                                    title="대화 초기화"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    <HiOutlineArrowPath className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleCloseChat}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    <HiOutlineXMark className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* 관광지 + 디바이스 선택 행 */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {isPlatformAdmin && (
                                <ChatSiteSelector
                                    sites={sites}
                                    currentSiteId={currentSiteId}
                                    onSelectSite={handleSelectSite}
                                />
                            )}
                            <ChatDeviceSelector
                                devices={filteredDevices}
                                selectedDeviceId={effectiveDeviceId}
                                onSelectDevice={handleSelectDevice}
                            />
                        </div>
                    </div>

                    {/* 메시지 목록 */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 bg-slate-50">
                        {messages.length === 0 && !isPending && (
                            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 gap-2">
                                <span className="text-3xl">💬</span>
                                <p className="text-sm">
                                    {!currentSiteId
                                        ? '관광지를 먼저 선택해주세요.'
                                        : !isReady
                                          ? '디바이스를 선택해주세요.'
                                          : '질문을 입력해 AI 응답을 테스트해보세요.'}
                                </p>
                            </div>
                        )}

                        {messages.map((message) => (
                            <ChatMessageBubble key={message.id} message={message} />
                        ))}

                        {isPending && <ChatTypingIndicator />}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* 입력 영역 */}
                    <div className="px-3 py-3 border-t border-slate-100 bg-white shrink-0">
                        <div className="flex items-end gap-2">
                            <textarea
                                value={inputText}
                                onChange={(event) => setInputText(event.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isPending || !isReady}
                                placeholder={
                                    !currentSiteId
                                        ? '관광지를 선택해주세요'
                                        : !isReady
                                          ? '디바이스를 선택해주세요'
                                          : isPending
                                            ? 'AI가 응답 중입니다...'
                                            : '메시지를 입력하세요 (Enter 전송)'
                                }
                                rows={1}
                                className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed max-h-24 overflow-y-auto"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputText.trim() || isPending || !isReady}
                                className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <HiOutlinePaperAirplane className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
