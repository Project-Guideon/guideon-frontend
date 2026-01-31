'use client';

import { motion } from 'framer-motion';
import { fadeIn } from '../styles/variants';
import { HiArrowRight, HiChatBubbleLeftRight, HiWrenchScrewdriver, HiMapPin, HiRocketLaunch } from 'react-icons/hi2';
import Link from 'next/link';

/**
 * HowItWorksSection
 */
const steps = [
    {
        num: '01',
        title: '상담',
        desc: '관광지 특성 분석 및 맞춤 설계',
        Icon: HiChatBubbleLeftRight,
    },
    {
        num: '02',
        title: '구축',
        desc: 'RAG 데이터 학습 및 UI 커스터마이징',
        Icon: HiWrenchScrewdriver,
    },
    {
        num: '03',
        title: '설치',
        desc: '하드웨어 설치 및 현장 운영 테스트',
        Icon: HiMapPin,
    },
    {
        num: '04',
        title: '운영',
        desc: '24/7 모니터링 및 정기 업데이트',
        Icon: HiRocketLaunch,
    },
];

export function HowItWorksSection() {
    return (
        <section id="process" className="h-screen bg-white relative overflow-hidden flex items-center">
            <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-orange-50 rounded-full blur-[80px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    variants={fadeIn('up', 0.1)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.5 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-[#FF6B52] rounded-full text-sm font-bold mb-6">
                        도입 프로세스
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                        단 <span className="text-[#FF6B52]">4단계</span>로 완성되는<br />
                        스마트 관광 시스템
                    </h2>

                    <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">
                        간단한 설정으로 함께하는 스마트 관광 시스템
                    </p>
                </motion.div>

                {/* Steps */}
                <motion.div
                    variants={fadeIn('up', 0.3)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    className="grid md:grid-cols-4 gap-0 relative max-w-5xl mx-auto"
                >
                    {steps.map((step, i) => (
                        <div key={i} className="group relative p-4">
                            {/* Connector (Horizontal) - Desktop */}
                            {i < steps.length - 1 && (
                                <div className="hidden md:block absolute top-[2rem] right-[-50%] w-full h-[2px] bg-slate-100 z-0">
                                    <div className="h-full bg-[#FF6B52] w-0 group-hover:w-full transition-all duration-700 ease-in-out" />
                                </div>
                            )}

                            <div className="relative z-10 flex flex-col items-center text-center">
                                {/* Icon Circle */}
                                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-100 group-hover:border-[#FF6B52] group-hover:bg-[#FF6B52] flex items-center justify-center mb-6 transition-all duration-300 shadow-sm group-hover:shadow-[0_10px_20px_rgba(255,107,82,0.3)] group-hover:-translate-y-1">
                                    <step.Icon className="w-7 h-7 text-slate-400 group-hover:text-white transition-colors duration-300" />
                                </div>

                                {/* Number */}
                                <span className="text-xs font-bold text-slate-300 mb-2 group-hover:text-[#FF6B52] transition-colors">STEP {step.num}</span>

                                {/* Content */}
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium px-2">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* CTA */}
                <motion.div
                    variants={fadeIn('up', 0.5)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.5 }}
                    className="text-center mt-20"
                >
                    <Link
                        href="#contact"
                        className="group inline-flex items-center gap-2 px-8 py-3 bg-white text-slate-900 border-2 border-slate-200 font-bold rounded-xl hover:border-[#FF6B52] hover:text-[#FF6B52] transition-all duration-300"
                    >
                        무료 상담 신청
                        <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
