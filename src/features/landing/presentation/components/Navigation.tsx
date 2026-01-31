'use client';

import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';

/**
 * Navigation
 */
export function Navigation() {
    const [hidden, setHidden] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
        setScrolled(latest > 50);
    });

    return (
        <motion.nav
            variants={{
                visible: { y: 0 },
                hidden: { y: -100 },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 transition-all duration-300 pointer-events-none`}
        >
            <div
                className={`pointer-events-auto flex items-center justify-between px-6 py-3 rounded-full border transition-all duration-300 ${scrolled
                        ? 'w-[90%] md:w-[70%] bg-white/70 backdrop-blur-xl border-white/20 shadow-lg shadow-black/5'
                        : 'w-full max-w-7xl bg-transparent border-transparent'
                    }`}
            >
                {/* 로고 */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative flex items-center justify-center w-10 h-10 overflow-hidden bg-slate-900 rounded-xl group-hover:scale-105 transition-transform duration-300">
                        <span className="text-white font-bold text-lg z-10">G</span>
                        {/* 로고 호버 효과 */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B52] to-[#ff9e8a] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>
                        GUIDE<span className="text-[#FF6B52]">ON</span>
                    </span>
                </Link>

                {/* 메뉴 items */}
                <div className="hidden md:flex items-center gap-1 bg-white/50 backdrop-blur-md rounded-full px-2 py-1 border border-white/20 shadow-inner">
                    {[
                        { name: '기능', href: '#features' },
                        { name: '가치', href: '#values' },
                        { name: '프로세스', href: '#process' },
                    ].map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            className="px-5 py-2 text-sm font-medium text-slate-600 rounded-full hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all duration-300"
                        >
                            {item.name}
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className={`text-sm font-semibold transition-colors ${scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        로그인
                    </Link>
                    <Link
                        href="/contact"
                        className="group relative px-6 py-2.5 bg-slate-900 text-white rounded-full overflow-hidden shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 transition-all hover:scale-105 active:scale-95"
                    >
                        <span className="relative z-10 text-sm font-bold flex items-center gap-2">
                            도입 문의
                            <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B52] to-[#F04A2E] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                </div>
            </div>
        </motion.nav>
    );
}
