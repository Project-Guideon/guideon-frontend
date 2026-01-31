'use client';

import { motion } from 'framer-motion';
import { fadeIn } from '../styles/variants';
import { HiArrowRight, HiEnvelope, HiPhone, HiMapPin } from 'react-icons/hi2';

/**
 * CTASection
 */
export function CTASection() {
    return (
        <section id="contact" className="h-screen bg-gradient-to-br from-[#FF6B52] to-[#FF8E7A] relative overflow-hidden flex items-center">
            {/* Clean Gradient & Decor */}
            <div className="absolute inset-0">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl" />
            </div>

            {/* Circles */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-20 left-20 w-32 h-32 border-4 border-white rounded-full" />
                <div className="absolute bottom-40 right-20 w-48 h-48 border-4 border-white rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        variants={fadeIn('up', 0.1)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/20 text-white rounded-full text-sm font-bold mb-8 backdrop-blur-md shadow-lg border border-white/20">
                            도입 문의
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight drop-shadow-sm">
                            관광지의 미래,<br />
                            지금 시작하세요
                        </h2>

                        <p className="text-white/90 text-xl max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
                            GUIDEON과 함께 방문객에게 감동을 주는<br />
                            새로운 소통 방식을 경험해보세요.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={fadeIn('up', 0.3)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
                    >
                        <a
                            href="mailto:contact@guideon.kr"
                            className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-[#FF6B52] font-bold rounded-2xl hover:bg-slate-50 transition-all duration-300 shadow-2xl hover:-translate-y-1 hover:shadow-white/20 w-full sm:w-auto text-lg"
                        >
                            <HiEnvelope className="w-6 h-6" />
                            이메일로 문의하기
                            <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </a>

                        <a
                            href="tel:02-1234-5678"
                            className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#FF6B52]/50 backdrop-blur-md text-white font-bold rounded-2xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300 w-full sm:w-auto text-lg shadow-lg"
                        >
                            <HiPhone className="w-6 h-6" />
                            02-1234-5678
                        </a>
                    </motion.div>

                    {/* Contact Cards */}
                    <motion.div
                        variants={fadeIn('up', 0.4)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.5 }}
                        className="grid md:grid-cols-3 gap-6"
                    >
                        {[
                            { Icon: HiEnvelope, label: '이메일', value: 'contact@guideon.kr' },
                            { Icon: HiPhone, label: '전화', value: '02-1234-5678' },
                            { Icon: HiMapPin, label: '주소', value: '서울특별시 강남구' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
                                <div className="w-14 h-14 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                                    <item.Icon className="w-7 h-7 text-white" />
                                </div>
                                <div className="text-white/70 text-sm mb-2 font-medium">{item.label}</div>
                                <div className="text-white font-bold text-lg">{item.value}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
