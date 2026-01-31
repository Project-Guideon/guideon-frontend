'use client';

import { motion } from 'framer-motion';
import { fadeIn } from '../styles/variants';

/**
 * StorySection
 */
const values = [
    {
        num: '01',
        title: 'Connect',
        subtitle: '연결',
        text: '언어의 장벽을 허물고 전 세계 방문객을 관광지와 연결합니다. 10개국 이상의 언어를 실시간으로 지원합니다.',
        icon: '🌐',
    },
    {
        num: '02',
        title: 'Understand',
        subtitle: '이해',
        text: 'AI가 깊이 있는 맥락을 이해하고 관광지 고유의 데이터를 바탕으로 정확한 답변을 제공합니다.',
        icon: '🧠',
    },
    {
        num: '03',
        title: 'Experience',
        subtitle: '경험',
        text: '단순 정보 전달을 넘어 자연스러운 대화로 방문객에게 잊지 못할 여행 경험을 선사합니다.',
        icon: '✨',
    },
];

export function StorySection() {
    return (
        <section className="py-24 bg-gradient-to-b from-white to-slate-50">
            <div className="container mx-auto px-6">
                <motion.div
                    variants={fadeIn('up', 0.1)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B52]/10 text-[#FF6B52] rounded-full text-sm font-semibold mb-4">
                        Our Values
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                        GUIDEON이 <span className="text-[#FF6B52]">추구하는 가치</span>
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {values.map((v, i) => (
                        <motion.div
                            key={i}
                            variants={fadeIn('up', 0.2 + i * 0.1)}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.3 }}
                            className="group relative bg-white rounded-2xl p-8 shadow-lg shadow-slate-100 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* 숫자 배경 */}
                            <span className="absolute top-4 right-4 text-6xl font-black text-slate-100 group-hover:text-[#FF6B52]/10 transition-colors duration-300">
                                {v.num}
                            </span>

                            {/* 아이콘 */}
                            <div className="text-4xl mb-4">{v.icon}</div>

                            {/* 제목 */}
                            <h3 className="text-2xl font-bold text-slate-900 mb-1">{v.title}</h3>
                            <p className="text-sm text-[#FF6B52] font-semibold mb-4">{v.subtitle}</p>

                            {/* 설명 */}
                            <p className="text-slate-600 leading-relaxed relative z-10">{v.text}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
