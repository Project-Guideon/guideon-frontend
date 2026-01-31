'use client';

import { motion } from 'framer-motion';
import {
    HiMicrophone,
    HiGlobeAlt,
    HiSquaresPlus,
    HiClock,
    HiMapPin,
    HiChartBar
} from 'react-icons/hi2';

import { fadeIn } from '../styles/variants';

/**
 * FeaturesSection
 */
const featuresData = [
    {
        Icon: HiMicrophone,
        title: 'AI 음성 대화',
        description: '자연어로 대화하듯 질문하면 AI가 찰떡같이 알아듣고 답변합니다.',
    },
    {
        Icon: HiGlobeAlt,
        title: '다국어 지원',
        description: '10개국 이상의 언어를 실시간 통역하여 외국인도 불편 없이 이용합니다.',
    },
    {
        Icon: HiSquaresPlus,
        title: 'RAG 기반 정확도',
        description: '관광지 고유 데이터를 학습해 할루시네이션 없이 정확하게 전달합니다.',
    },
    {
        Icon: HiClock,
        title: '실시간 정보',
        description: '혼잡도, 날씨, 대기시간 등을 실시간으로 반영하여 안내합니다.',
    },
    {
        Icon: HiMapPin,
        title: '위치 기반 추천',
        description: '현재 위치 기반으로 가까운 명소, 맛집, 편의시설을 추천합니다.',
    },
    {
        Icon: HiChartBar,
        title: '관리자 대시보드',
        description: '방문객 통계, 인기 질문 등을 직관적 차트로 시각화합니다.',
    },
];

export function FeaturesSection() {
    return (
        <section id="features" className="h-screen bg-[#efefef] relative overflow-hidden flex items-center">
            {/* Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-white rounded-full blur-[80px] pointer-events-none opacity-60" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left */}
                    <motion.div
                        variants={fadeIn('right', 0.2)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-bold mb-6">
                            핵심 기능
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                            최신 AI 기술로<br />
                            <span className="text-[#FF6B52]">새로운 관광 경험</span>
                        </h2>

                        <p className="text-slate-600 text-lg leading-relaxed mb-8 font-medium">
                            단순한 안내 시스템이 아닌, 방문객과 진정으로 소통하는 AI 파트너입니다.
                            GUIDEON은 단순함 속에 강력한 기술을 담았습니다.
                        </p>

                        {/* Stats */}
                        <div className="flex gap-4">
                            {[
                                { value: '99%', label: '응답 정확도' },
                                { value: '0.5s', label: '평균 응답 시간' },
                                { value: '24/7', label: '무인 운영' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex-1 text-center hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-black text-[#FF6B52] mb-1">{stat.value}</div>
                                    <div className="text-xs text-slate-500 font-bold">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right */}
                    <motion.div
                        variants={fadeIn('left', 0.4)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {featuresData.map((item, i) => (
                            <div
                                key={i}
                                className="group relative bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#FF6B52] hover:shadow-lg hover:shadow-[#FF6B52]/10 transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-[#FF6B52]/10 flex items-center justify-center mb-4 transition-colors duration-300">
                                    <item.Icon className="w-6 h-6 text-slate-400 group-hover:text-[#FF6B52] transition-colors duration-300" aria-hidden />
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.description}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
