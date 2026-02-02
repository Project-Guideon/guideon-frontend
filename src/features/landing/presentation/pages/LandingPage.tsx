'use client';

import { Header } from '../components/Header';
import { SideNav } from '../components/SideNav';
import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { CTASection } from '../components/CTASection';
import { Footer } from '../components/Footer';

/**
 * GUIDEON Landing Page v8
 * 
 * - 각 섹션 풀스크린 (h-screen)
 * - 섹션별 다른 배경색 그라디언트
 * - 스냅 스크롤 (html 레벨에서 적용)
 * - 섹션마다 다른 레이아웃
 */
export function LandingPage() {
    return (
        <div className="landing-page bg-white text-slate-900 overflow-x-hidden">
            <Header />
            <SideNav />

            <main>
                <HeroSection />
                <FeaturesSection />
                <HowItWorksSection />
                <CTASection />
            </main>

            <Footer />
        </div>
    );
}
