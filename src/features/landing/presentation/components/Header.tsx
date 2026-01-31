'use client';

import Link from 'next/link';
import Image from 'next/image';

/**
 * Header
 */
export function Header() {
    return (
        <header className="absolute top-0 left-0 right-0 z-40 py-6 px-6">
            <div className="container mx-auto">
                <div className="flex items-center justify-between">
                    {/* 로고 */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 group-hover:scale-105 transition-transform duration-300">
                            <Image
                                src="/images/logo.png"
                                alt="Guideon Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-xl font-bold text-slate-900">
                            GUIDE<span className="text-[#FF6B52]">ON</span>
                        </span>
                    </Link>

                    {/* 네비게이션 */}
                    <nav className="hidden md:flex items-center gap-6">
                        <a href="#features" className="text-slate-600 hover:text-[#FF6B52] transition-colors font-medium">
                            기능
                        </a>
                        <a href="#process" className="text-slate-600 hover:text-[#FF6B52] transition-colors font-medium">
                            프로세스
                        </a>

                        <div className="w-px h-4 bg-slate-200 mx-2" />

                        {/* 로그인 & 도입문의 */}
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-slate-900 font-semibold hover:text-[#FF6B52] transition-colors"
                            >
                                로그인
                            </Link>
                            <Link
                                href="#contact"
                                className="px-6 py-2.5 bg-[#FF6B52] text-white font-bold rounded-lg hover:bg-[#e55a43] transition-colors shadow-lg shadow-[#FF6B52]/20"
                            >
                                도입 문의
                            </Link>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}
