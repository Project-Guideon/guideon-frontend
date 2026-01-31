'use client';

import Link from 'next/link';
import Image from 'next/image';

/**
 * Footer
 */
export function Footer() {
    return (
        <footer className="bg-slate-50 text-slate-600 py-8 border-t border-slate-200">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* 로고 */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative w-8 h-8">
                            <Image
                                src="/images/logo.png"
                                alt="Guideon Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="font-bold text-slate-900">GUIDEON</span>
                    </Link>

                    {/* 카피라이트 */}
                    <div className="text-sm">
                        © {new Date().getFullYear()} GUIDEON. All rights reserved.
                    </div>

                    {/* 링크 */}
                    <div className="flex gap-6 text-sm">
                        <a href="#" className="hover:text-[#FF6B52] transition-colors">이용약관</a>
                        <a href="#" className="hover:text-[#FF6B52] transition-colors">개인정보처리방침</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
