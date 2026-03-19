'use client';

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineXMark,
    HiOutlineSparkles,
    HiOutlineChevronDown,
} from 'react-icons/hi2';
import type {
    Mascot,
    CreateMascotRequest,
    UpdateMascotRequest,
} from '@/features/mascot/domain/entities/Mascot';
import { DEFAULT_ANIM_OPTIONS, TTS_VOICE_OPTIONS } from '@/features/mascot/domain/entities/Mascot';

type FormTab = 'basic' | 'prompt' | 'tts';

interface MascotFormModalProps {
    isOpen: boolean;
    mode: 'create' | 'edit';
    editTarget: Mascot | null;
    /** edit 모드에서 특정 탭을 열기 위한 초기 탭 */
    initialTab?: FormTab;
    isSaving: boolean;
    onClose: () => void;
    onSubmit: (request: CreateMascotRequest | UpdateMascotRequest) => void;
}

const TABS: { id: FormTab; label: string }[] = [
    { id: 'basic', label: '기본 정보' },
    { id: 'prompt', label: 'AI 프롬프트' },
    { id: 'tts', label: 'TTS 음성' },
];

/**
 * 마스코트 생성/수정 모달
 *
 * - 탭 기반 폼 (기본 정보 / AI 프롬프트 / TTS 음성)
 * - create: 전체 필드 입력, edit: 변경된 필드만 전송
 */
export function MascotFormModal({
    isOpen,
    mode,
    editTarget,
    initialTab = 'basic',
    isSaving,
    onClose,
    onSubmit,
}: MascotFormModalProps) {
    const [activeTab, setActiveTab] = useState<FormTab>(initialTab);

    // 기본 정보
    const [name, setName] = useState('');
    const [modelId, setModelId] = useState('');
    const [defaultAnim, setDefaultAnim] = useState('IDLE_A');
    const [greetingMsg, setGreetingMsg] = useState('');
    const [isActive, setIsActive] = useState(true);

    // AI 프롬프트
    const [systemPrompt, setSystemPrompt] = useState('');
    const [basePersona, setBasePersona] = useState('');
    const [smalltalkStyle, setSmalltalkStyle] = useState('');
    const [answerStyle, setAnswerStyle] = useState('');

    // TTS 음성
    const [ttsVoiceId, setTtsVoiceId] = useState('ko-KR-Wavenet-A');
    const [ttsSpeed, setTtsSpeed] = useState('1.0');
    const [ttsPitch, setTtsPitch] = useState('0');

    // 드롭다운 상태
    const [isAnimDropdownOpen, setIsAnimDropdownOpen] = useState(false);
    const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);

    // 모달 열릴 때 초기화
    useEffect(() => {
        if (!isOpen) return;
        setActiveTab(initialTab);

        if (mode === 'edit' && editTarget) {
            setName(editTarget.name);
            setModelId(editTarget.modelId);
            setDefaultAnim(editTarget.defaultAnim);
            setGreetingMsg(editTarget.greetingMsg);
            setIsActive(editTarget.isActive);
            setSystemPrompt(editTarget.systemPrompt);
            setBasePersona(editTarget.promptConfig?.base_persona ?? '');
            setSmalltalkStyle(editTarget.promptConfig?.smalltalk_style ?? '');
            setAnswerStyle(editTarget.promptConfig?.answer_style ?? '');
            setTtsVoiceId(editTarget.ttsVoiceId);
            setTtsSpeed(String(editTarget.ttsVoiceJson?.speed ?? '1.0'));
            setTtsPitch(String(editTarget.ttsVoiceJson?.pitch ?? '0'));
        } else {
            setName('');
            setModelId('');
            setDefaultAnim('IDLE_A');
            setGreetingMsg('');
            setIsActive(true);
            setSystemPrompt('');
            setBasePersona('');
            setSmalltalkStyle('');
            setAnswerStyle('');
            setTtsVoiceId('ko-KR-Wavenet-A');
            setTtsSpeed('1.0');
            setTtsPitch('0');
        }
    }, [isOpen, mode, editTarget, initialTab]);

    // ESC 닫기
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const buildPromptConfig = () => {
        const config: Record<string, string> = {};
        if (basePersona.trim()) config.base_persona = basePersona.trim();
        if (smalltalkStyle.trim()) config.smalltalk_style = smalltalkStyle.trim();
        if (answerStyle.trim()) config.answer_style = answerStyle.trim();
        return Object.keys(config).length > 0 ? config : undefined;
    };

    const buildTtsVoiceJson = () => {
        const speed = parseFloat(ttsSpeed);
        const pitch = parseFloat(ttsPitch);
        const json: Record<string, number> = {};
        if (!isNaN(speed) && speed !== 1.0) json.speed = speed;
        if (!isNaN(pitch) && pitch !== 0) json.pitch = pitch;
        return Object.keys(json).length > 0 ? json : undefined;
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (mode === 'create') {
            const request: CreateMascotRequest = {
                name: name.trim(),
                modelId: modelId.trim(),
                defaultAnim,
                greetingMsg: greetingMsg.trim(),
                systemPrompt: systemPrompt.trim(),
                promptConfig: buildPromptConfig(),
                ttsVoiceId,
                ttsVoiceJson: buildTtsVoiceJson(),
            };
            onSubmit(request);
        } else {
            const request: UpdateMascotRequest = {
                name: name.trim(),
                modelId: modelId.trim(),
                defaultAnim,
                greetingMsg: greetingMsg.trim(),
                systemPrompt: systemPrompt.trim(),
                promptConfig: buildPromptConfig(),
                ttsVoiceId,
                ttsVoiceJson: buildTtsVoiceJson(),
                isActive,
            };
            onSubmit(request);
        }
    };

    const isFormValid =
        name.trim().length > 0 &&
        modelId.trim().length > 0 &&
        greetingMsg.trim().length > 0 &&
        systemPrompt.trim().length > 0;

    const inputClass =
        'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50';
    const textareaClass = `${inputClass} resize-none`;
    const labelClass = 'block text-sm font-bold text-slate-700 mb-1.5';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40"
                            onClick={onClose}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full max-w-lg text-left bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="mascot-form-title"
                        >
                            {/* 헤더 */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                                <h3
                                    id="mascot-form-title"
                                    className="text-lg font-bold text-slate-800 flex items-center gap-2"
                                >
                                    <HiOutlineSparkles className="w-5 h-5 text-orange-500" />
                                    {mode === 'create' ? '마스코트 등록' : '마스코트 수정'}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                    aria-label="닫기"
                                >
                                    <HiOutlineXMark className="w-5 h-5" />
                                </button>
                            </div>

                            {/* 탭 네비게이션 */}
                            <div className="flex border-b border-slate-100 px-6 shrink-0">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative px-4 py-3 text-sm font-bold transition-colors ${
                                            activeTab === tab.id
                                                ? 'text-orange-600'
                                                : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                    >
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="mascot-tab-indicator"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* 폼 */}
                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {/* 기본 정보 탭 */}
                                    {activeTab === 'basic' && (
                                        <>
                                            <div>
                                                <label htmlFor="mascot-name" className={labelClass}>이름 *</label>
                                                <input
                                                    id="mascot-name"
                                                    type="text"
                                                    value={name}
                                                    onChange={(event) => setName(event.target.value)}
                                                    placeholder="예: 해치"
                                                    maxLength={50}
                                                    autoFocus
                                                    className={inputClass}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="mascot-model-id" className={labelClass}>모델 ID *</label>
                                                <input
                                                    id="mascot-model-id"
                                                    type="text"
                                                    value={modelId}
                                                    onChange={(event) => setModelId(event.target.value)}
                                                    placeholder="예: haechi_v1"
                                                    maxLength={100}
                                                    className={inputClass}
                                                />
                                            </div>

                                            {/* 기본 애니메이션 드롭다운 */}
                                            <div>
                                                <label className={labelClass}>기본 애니메이션</label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        aria-haspopup="listbox"
                                                        aria-expanded={isAnimDropdownOpen}
                                                        onClick={() => setIsAnimDropdownOpen(!isAnimDropdownOpen)}
                                                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                                                    >
                                                        <span>
                                                            {DEFAULT_ANIM_OPTIONS.find((opt) => opt.value === defaultAnim)?.label ?? defaultAnim}
                                                        </span>
                                                        <HiOutlineChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isAnimDropdownOpen ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    <AnimatePresence>
                                                        {isAnimDropdownOpen && (
                                                            <>
                                                                <div className="fixed inset-0 z-40" onClick={() => setIsAnimDropdownOpen(false)} />
                                                                <motion.div
                                                                    role="listbox"
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -10 }}
                                                                    transition={{ duration: 0.15 }}
                                                                    className="absolute top-full left-0 mt-2 w-full bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 overflow-hidden"
                                                                >
                                                                    {DEFAULT_ANIM_OPTIONS.map((opt) => (
                                                                        <button
                                                                            key={opt.value}
                                                                            type="button"
                                                                            role="option"
                                                                            aria-selected={defaultAnim === opt.value}
                                                                            onClick={() => {
                                                                                setDefaultAnim(opt.value);
                                                                                setIsAnimDropdownOpen(false);
                                                                            }}
                                                                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                                                                                defaultAnim === opt.value
                                                                                    ? 'bg-orange-50 text-orange-600 font-bold'
                                                                                    : 'text-slate-600 hover:bg-slate-50'
                                                                            }`}
                                                                        >
                                                                            {opt.label}
                                                                        </button>
                                                                    ))}
                                                                </motion.div>
                                                            </>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="mascot-greeting" className={labelClass}>인사말 *</label>
                                                <textarea
                                                    id="mascot-greeting"
                                                    value={greetingMsg}
                                                    onChange={(event) => setGreetingMsg(event.target.value)}
                                                    placeholder="예: 안녕하세요! 저는 해치예요. 무엇을 도와드릴까요?"
                                                    rows={2}
                                                    maxLength={500}
                                                    className={textareaClass}
                                                />
                                            </div>

                                            {/* 활성 상태 (수정 모드에서만) */}
                                            {mode === 'edit' && (
                                                <div className="flex items-center justify-between px-1">
                                                    <span className="text-sm font-bold text-slate-700">활성 상태</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsActive(!isActive)}
                                                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isActive ? 'bg-orange-500' : 'bg-slate-300'}`}
                                                        role="switch"
                                                        aria-checked={isActive}
                                                        aria-label="활성 상태 토글"
                                                    >
                                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isActive ? 'translate-x-5' : ''}`} />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* AI 프롬프트 탭 */}
                                    {activeTab === 'prompt' && (
                                        <>
                                            <div>
                                                <label htmlFor="mascot-system-prompt" className={labelClass}>시스템 프롬프트 *</label>
                                                <textarea
                                                    id="mascot-system-prompt"
                                                    value={systemPrompt}
                                                    onChange={(event) => setSystemPrompt(event.target.value)}
                                                    placeholder="마스코트의 성격, 역할, 대화 규칙 등을 설정하세요..."
                                                    rows={6}
                                                    className={textareaClass}
                                                />
                                            </div>

                                            <div className="pt-2">
                                                <p className="text-xs font-bold text-slate-400 mb-3">프롬프트 설정 (선택)</p>

                                                <div className="space-y-3">
                                                    <div>
                                                        <label htmlFor="mascot-persona" className="block text-xs font-medium text-slate-500 mb-1">기본 페르소나</label>
                                                        <input
                                                            id="mascot-persona"
                                                            type="text"
                                                            value={basePersona}
                                                            onChange={(event) => setBasePersona(event.target.value)}
                                                            placeholder="예: 친근한 관광 가이드"
                                                            className={inputClass}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="mascot-smalltalk" className="block text-xs font-medium text-slate-500 mb-1">스몰토크 스타일</label>
                                                        <input
                                                            id="mascot-smalltalk"
                                                            type="text"
                                                            value={smalltalkStyle}
                                                            onChange={(event) => setSmalltalkStyle(event.target.value)}
                                                            placeholder="예: 유머러스하고 따뜻한"
                                                            className={inputClass}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label htmlFor="mascot-answer-style" className="block text-xs font-medium text-slate-500 mb-1">답변 스타일</label>
                                                        <input
                                                            id="mascot-answer-style"
                                                            type="text"
                                                            value={answerStyle}
                                                            onChange={(event) => setAnswerStyle(event.target.value)}
                                                            placeholder="예: 간결하고 명확한"
                                                            className={inputClass}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* TTS 음성 탭 */}
                                    {activeTab === 'tts' && (
                                        <>
                                            {/* 음성 선택 드롭다운 */}
                                            <div>
                                                <label className={labelClass}>음성 선택</label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        aria-haspopup="listbox"
                                                        aria-expanded={isVoiceDropdownOpen}
                                                        onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                                                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-50"
                                                    >
                                                        <span>
                                                            {TTS_VOICE_OPTIONS.find((opt) => opt.value === ttsVoiceId)?.label ?? ttsVoiceId}
                                                        </span>
                                                        <HiOutlineChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isVoiceDropdownOpen ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    <AnimatePresence>
                                                        {isVoiceDropdownOpen && (
                                                            <>
                                                                <div className="fixed inset-0 z-40" onClick={() => setIsVoiceDropdownOpen(false)} />
                                                                <motion.div
                                                                    role="listbox"
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -10 }}
                                                                    transition={{ duration: 0.15 }}
                                                                    className="absolute top-full left-0 mt-2 w-full bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 overflow-hidden"
                                                                >
                                                                    {TTS_VOICE_OPTIONS.map((opt) => (
                                                                        <button
                                                                            key={opt.value}
                                                                            type="button"
                                                                            role="option"
                                                                            aria-selected={ttsVoiceId === opt.value}
                                                                            onClick={() => {
                                                                                setTtsVoiceId(opt.value);
                                                                                setIsVoiceDropdownOpen(false);
                                                                            }}
                                                                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                                                                                ttsVoiceId === opt.value
                                                                                    ? 'bg-orange-50 text-orange-600 font-bold'
                                                                                    : 'text-slate-600 hover:bg-slate-50'
                                                                            }`}
                                                                        >
                                                                            {opt.label}
                                                                        </button>
                                                                    ))}
                                                                </motion.div>
                                                            </>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            {/* 속도 & 피치 */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label htmlFor="mascot-tts-speed" className={labelClass}>속도</label>
                                                    <div className="space-y-2">
                                                        <input
                                                            id="mascot-tts-speed"
                                                            type="range"
                                                            min="0.5"
                                                            max="2.0"
                                                            step="0.1"
                                                            value={ttsSpeed}
                                                            onChange={(event) => setTtsSpeed(event.target.value)}
                                                            className="w-full accent-orange-500"
                                                        />
                                                        <p className="text-center text-sm font-bold text-slate-600">{parseFloat(ttsSpeed).toFixed(1)}x</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="mascot-tts-pitch" className={labelClass}>피치</label>
                                                    <div className="space-y-2">
                                                        <input
                                                            id="mascot-tts-pitch"
                                                            type="range"
                                                            min="-10"
                                                            max="10"
                                                            step="1"
                                                            value={ttsPitch}
                                                            onChange={(event) => setTtsPitch(event.target.value)}
                                                            className="w-full accent-orange-500"
                                                        />
                                                        <p className="text-center text-sm font-bold text-slate-600">{ttsPitch}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-400 px-1">
                                                속도 1.0x, 피치 0이 기본값입니다. 변경하지 않으면 기본값이 적용됩니다.
                                            </p>
                                        </>
                                    )}
                                </div>

                                {/* 액션 버튼 */}
                                <div className="flex gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isSaving}
                                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-50"
                                    >
                                        취소
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!isFormValid || isSaving}
                                        className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                                    >
                                        {isSaving ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                저장 중...
                                            </span>
                                        ) : (
                                            mode === 'create' ? '등록' : '저장'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
