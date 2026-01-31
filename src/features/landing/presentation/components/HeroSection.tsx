'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi2';
import Image from 'next/image';

import { fadeIn } from '../styles/variants';

/**
 * HeroSection
 */
export function HeroSection() {
    return (
        <section id="hero" className="h-screen bg-[#FFF8F6] relative overflow-hidden flex items-center">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-100/40 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/80 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left */}
                    <div className="text-center lg:text-left">
                        <motion.div
                            variants={fadeIn('up', 0.1)}
                            initial="hidden"
                            animate="show"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-orange-100 text-[#FF6B52] rounded-full text-sm font-bold mb-6 shadow-sm"
                        >
                            <span className="w-2 h-2 bg-[#FF6B52] rounded-full animate-pulse" />
                            AI 기반 스마트 키오스크
                        </motion.div>

                        <motion.h1
                            variants={fadeIn('up', 0.2)}
                            initial="hidden"
                            animate="show"
                            className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6"
                        >
                            관광지에<br />
                            <span className="text-[#FF6B52]">생명을 불어넣다</span>
                        </motion.h1>

                        <motion.p
                            variants={fadeIn('up', 0.3)}
                            initial="hidden"
                            animate="show"
                            className="text-xl text-slate-600 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium"
                        >
                            AI 음성 대화와 실시간 다국어 지원으로 방문객에게
                            잊지 못할 경험을 선사하는 스마트 키오스크 솔루션
                        </motion.p>

                        <motion.div
                            variants={fadeIn('up', 0.4)}
                            initial="hidden"
                            animate="show"
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                        >
                            <Link
                                href="#contact"
                                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FF6B52] text-white font-bold rounded-xl hover:bg-[#e55a43] transition-all duration-300 shadow-xl shadow-[#FF6B52]/20 hover:shadow-2xl hover:shadow-[#FF6B52]/30 hover:-translate-y-1"
                            >
                                도입 문의하기
                                <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                href="#features"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:border-[#FF6B52] hover:text-[#FF6B52] transition-all duration-300 shadow-lg"
                            >
                                기능 살펴보기
                            </Link>
                        </motion.div>

                        {/* Trust Stats */}
                        <motion.div
                            variants={fadeIn('up', 0.5)}
                            initial="hidden"
                            animate="show"
                            className="mt-12 pt-8 border-t border-orange-100 flex flex-wrap gap-8 justify-center lg:justify-start"
                        >
                            {[
                                { value: '10+', label: '지원 언어' },
                                { value: '24/7', label: '무인 운영' },
                                { value: '99%', label: '응답 정확도' },
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                                    <div className="text-sm text-slate-500 font-bold">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right */}
                    <motion.div
                        variants={fadeIn('left', 0.4)}
                        initial="hidden"
                        animate="show"
                        className="relative hidden lg:block"
                    >
                        <div className="relative mx-auto w-[340px]">
                            {/* Kiosk Body */}
                            <div className="bg-white rounded-[2.5rem] p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border-4 border-slate-50 relative z-10 ring-1 ring-slate-200">
                                <div className="aspect-[9/16] bg-slate-900 rounded-[2rem] overflow-hidden relative border-4 border-black/5 shadow-inner">
                                    <div className="absolute inset-0">
                                        <Image
                                            src="/images/monitor.png"
                                            alt="Kiosk Screen Interface"
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stand */}
                            <div className="mx-auto w-24 h-20 bg-gradient-to-b from-slate-100 to-slate-200 -mt-4 relative z-0 border-x border-slate-200" />
                            <div className="mx-auto w-48 h-6 bg-slate-200 rounded-full shadow-lg border-t border-white/50 -mt-1 relative z-10" />
                        </div>

                        {/* Floating Cards */}
                        <div className="absolute top-20 -right-8 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 animate-float flex items-center gap-4 z-20" style={{ animationDelay: '0.5s' }}>
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🌍</span>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900">다국어 지원</div>
                                <div className="text-xs text-slate-500 font-medium">10개국 언어</div>
                            </div>
                        </div>

                        <div className="absolute bottom-40 -left-12 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 animate-float flex items-center gap-4 z-20" style={{ animationDelay: '1s' }}>
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🎙️</span>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900">음성 대화</div>
                                <div className="text-xs text-slate-500 font-medium">자연어 AI</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
