'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    HiOutlineSparkles,
    HiOutlinePlusCircle,
    HiOutlineExclamationTriangle,
    HiOutlineArrowPath,
} from 'react-icons/hi2';
import { useAuthContext } from '@/features/auth/application/store/AuthContext';
import { useMascot } from '@/features/mascot/application/hooks/useMascot';
import { MascotInfoCard } from './MascotInfoCard';
import { MascotPromptCard } from './MascotPromptCard';
import { MascotTtsCard } from './MascotTtsCard';
import { MascotModelCard } from './MascotModelCard';
import { MascotFormModal } from './MascotFormModal';
import type { CreateMascotRequest, UpdateMascotRequest } from '@/features/mascot/domain/entities/Mascot';

type FormTab = 'basic' | 'prompt' | 'tts';

/**
 * 마스코트 관리 메인 뷰
 *
 * - 마스코트 미등록: 등록 유도 빈 상태
 * - 마스코트 등록 완료: 정보·프롬프트·TTS·3D 모델 카드 구성
 * - PLATFORM_ADMIN 전용 (사이트 선택 필요)
 */
export function MascotSettingsView() {
    const { currentSiteId, sites } = useAuthContext();
    const {
        mascot,
        generation,
        isLoading,
        isSaving,
        isGenerating,
        isPolling,
        error,
        notFound,
        fetchMascot,
        createMascot,
        updateMascot,
        startGeneration,
        clearError,
    } = useMascot(currentSiteId);

    // 모달 상태
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formInitialTab, setFormInitialTab] = useState<FormTab>('basic');

    const currentSiteName = sites.find((site) => site.siteId === currentSiteId)?.name ?? '';

    // ───────────── 이벤트 핸들러 ─────────────

    const handleClickCreate = () => {
        setFormMode('create');
        setFormInitialTab('basic');
        setIsFormOpen(true);
    };

    const handleClickEditInfo = () => {
        setFormMode('edit');
        setFormInitialTab('basic');
        setIsFormOpen(true);
    };

    const handleClickEditPrompt = () => {
        setFormMode('edit');
        setFormInitialTab('prompt');
        setIsFormOpen(true);
    };

    const handleClickEditTts = () => {
        setFormMode('edit');
        setFormInitialTab('tts');
        setIsFormOpen(true);
    };

    const handleSubmitForm = async (request: CreateMascotRequest | UpdateMascotRequest) => {
        let success: boolean;
        if (formMode === 'create') {
            success = await createMascot(request as CreateMascotRequest);
        } else {
            success = await updateMascot(request as UpdateMascotRequest);
        }
        if (success) {
            setIsFormOpen(false);
        }
    };

    // ───────────── 사이트 미선택 상태 ─────────────
    if (!currentSiteId) {
        return (
            <div className="flex flex-col gap-4">
                <PageHeader />
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                        <HiOutlineExclamationTriangle className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">관광지를 선택해주세요</h3>
                    <p className="text-sm text-slate-400 max-w-sm">
                        마스코트를 관리하려면 먼저 사이드바에서 관광지를 선택해야 합니다.
                    </p>
                </div>
            </div>
        );
    }

    // ───────────── 로딩 상태 ─────────────
    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                <PageHeader siteName={currentSiteName} />
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm font-medium text-slate-500">마스코트 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // ───────────── 에러 상태 ─────────────
    if (error && !mascot) {
        return (
            <div className="flex flex-col gap-4">
                <PageHeader siteName={currentSiteName} />
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                        <HiOutlineExclamationTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">오류가 발생했습니다</h3>
                    <p className="text-sm text-slate-400 mb-6 max-w-sm">{error}</p>
                    <button
                        onClick={() => { clearError(); fetchMascot(); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all duration-200 active:scale-[0.98]"
                    >
                        <HiOutlineArrowPath className="w-4 h-4" />
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    // ───────────── 마스코트 미등록 (빈 상태) ─────────────
    if (notFound || !mascot) {
        return (
            <div className="flex flex-col gap-4">
                <PageHeader siteName={currentSiteName} />
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center text-center"
                >
                    <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center mb-5">
                        <HiOutlineSparkles className="w-10 h-10 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        아직 마스코트가 등록되지 않았습니다
                    </h3>
                    <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
                        이 관광지에 AI 마스코트를 등록하면 키오스크에서 방문객과 대화하며 관광 안내를 제공할 수 있습니다.
                    </p>
                    <button
                        onClick={handleClickCreate}
                        className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all duration-200 active:scale-[0.98]"
                    >
                        <HiOutlinePlusCircle className="w-5 h-5" />
                        마스코트 등록하기
                    </button>
                </motion.div>

                {/* 생성 모달 */}
                <MascotFormModal
                    key={isFormOpen ? 'create-new' : 'closed'}
                    isOpen={isFormOpen}
                    mode="create"
                    editTarget={null}
                    isSaving={isSaving}
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={handleSubmitForm}
                />
            </div>
        );
    }

    // ───────────── 마스코트 등록 완료 ─────────────
    return (
        <div className="flex flex-col gap-4">
            <PageHeader siteName={currentSiteName} mascotName={mascot.name} />

            {/* 에러 배너 */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-100 rounded-2xl px-5 py-3 flex items-center justify-between"
                >
                    <p className="text-sm font-medium text-red-600">{error}</p>
                    <button
                        onClick={clearError}
                        className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors px-2 py-1"
                    >
                        닫기
                    </button>
                </motion.div>
            )}

            {/* 카드 그리드 */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
                <MascotInfoCard mascot={mascot} onEdit={handleClickEditInfo} />
                <MascotPromptCard mascot={mascot} onEdit={handleClickEditPrompt} />
                <MascotTtsCard mascot={mascot} onEdit={handleClickEditTts} />
                <MascotModelCard
                    mascot={mascot}
                    generation={generation}
                    isGenerating={isGenerating}
                    isPolling={isPolling}
                    onStartGeneration={startGeneration}
                />
            </motion.div>

            {/* 수정 모달 */}
            <MascotFormModal
                key={isFormOpen ? `edit-${formInitialTab}` : 'closed'}
                isOpen={isFormOpen}
                mode={formMode}
                editTarget={mascot}
                initialTab={formInitialTab}
                isSaving={isSaving}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleSubmitForm}
            />
        </div>
    );
}

/**
 * 페이지 헤더
 */
function PageHeader({ siteName, mascotName }: { siteName?: string; mascotName?: string }) {
    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <HiOutlineSparkles className="w-7 h-7 text-orange-500" />
                마스코트 관리
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">
                {siteName && (
                    <>
                        <span className="font-bold text-orange-600">{siteName}</span>의{' '}
                    </>
                )}
                {mascotName ? (
                    <>AI 마스코트 <span className="font-bold text-slate-700">{mascotName}</span> 설정</>
                ) : (
                    'AI 마스코트를 등록하고 관리합니다'
                )}
            </p>
        </div>
    );
}
