'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HiHome, HiSparkles, HiCog6Tooth, HiEnvelope } from 'react-icons/hi2';

/**
 * SideNav
 */
const navData = [
    { name: '홈', path: '#hero', Icon: HiHome },
    { name: '기능', path: '#features', Icon: HiSparkles },
    { name: '프로세스', path: '#process', Icon: HiCog6Tooth },
    { name: '문의', path: '#contact', Icon: HiEnvelope },
];

export function SideNav() {
    const [activeSection, setActiveSection] = useState('#hero');

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['hero', 'features', 'process', 'contact'];
            const scrollPosition = window.scrollY + window.innerHeight / 2;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(`#${section}`);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className="hidden xl:flex flex-col items-center justify-center gap-y-4 fixed right-[2%] z-50 top-1/2 -translate-y-1/2 h-max">
            <div className="flex flex-col items-center justify-center gap-y-5 px-4 py-8 bg-white/70 backdrop-blur-2xl rounded-full shadow-2xl shadow-black/5 border border-slate-200">
                {navData.map((link, i) => (
                    <Link
                        key={i}
                        href={link.path}
                        className={`relative flex items-center group transition-all duration-300 p-3 rounded-full ${activeSection === link.path
                            ? 'text-white bg-gradient-to-br from-[#FF6B52] to-[#ff9a8a] shadow-lg shadow-[#FF6B52]/40'
                            : 'text-slate-500 hover:text-[#FF6B52] hover:bg-[#FF6B52]/10'
                            }`}
                    >
                        {/* 툴팁 */}
                        <div
                            role="tooltip"
                            className="absolute right-full mr-4 hidden group-hover:block pointer-events-none"
                        >
                            <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap shadow-xl">
                                {link.name}
                            </div>
                        </div>

                        <link.Icon className="w-5 h-5" aria-hidden />
                    </Link>
                ))}
            </div>
        </nav>
    );
}
