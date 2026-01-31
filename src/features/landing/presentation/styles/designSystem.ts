/**
 * GUIDEON Brand Design System
 * 
 * 브랜드 철학:
 * "관광지에 생명을 불어넣다" 
 * - 사람과 장소를 연결하고
 * - AI를 통해 소통하며  
 * - 새로운 발견을 선사하는
 * 
 * 핵심 가치:
 * 1. CONNECTION (연결) - 방문객과 관광지를 잇는 다리
 * 2. INTELLIGENCE (지능) - AI 기반 맞춤형 안내
 * 3. EXPERIENCE (경험) - 잊지 못할 순간의 창조
 */

// ========================================
// GUIDEON 상징 컬러 시스템
// ========================================

export const colors = {
    // Primary: GUIDEON Coral
    // - 따뜻하고 환영하는 느낌
    // - 관광지의 활기와 생동감 표현
    // - 사람 중심의 서비스 철학
    primary: {
        50: '#FFF5F3',
        100: '#FFE8E4',
        200: '#FFCFC6',
        300: '#FFB0A1',
        400: '#FF8A75',
        500: '#FF6B52', // ← GUIDEON 대표색
        600: '#F04A2E',
        700: '#CC3A22',
        800: '#A62E1A',
        900: '#7A2314',
    },

    // Secondary: Ocean Blue
    // - 신뢰와 안정감
    // - 기술력과 전문성
    // - 넓은 세계로의 연결
    secondary: {
        50: '#F0F9FF',
        100: '#E0F2FE',
        200: '#BAE6FD',
        300: '#7DD3FC',
        400: '#38BDF8',
        500: '#0EA5E9',
        600: '#0284C7',
        700: '#0369A1',
        800: '#075985',
        900: '#0C4A6E',
    },

    // Accent: Mint
    // - 신선함과 혁신
    // - 자연 친화적 관광
    accent: {
        400: '#34D399',
        500: '#10B981',
        600: '#059669',
    },

    // Neutral
    slate: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A',
    },
} as const;

// ========================================
// 애니메이션 프리셋
// ========================================

export const animations = {
    // 스크롤 기반 Reveal
    fadeInUp: {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },

    fadeInLeft: {
        initial: { opacity: 0, x: -60 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },

    fadeInRight: {
        initial: { opacity: 0, x: 60 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },

    // 스케일 업
    scaleIn: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },

    // Stagger 컨테이너
    staggerContainer: {
        animate: {
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    },

    staggerItem: {
        initial: { opacity: 0, y: 20 },
        animate: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
    },
} as const;

// ========================================
// 타이포그래피
// ========================================

export const typography = {
    // Display (Hero 제목)
    display: 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]',

    // Heading
    h1: 'text-4xl md:text-5xl font-bold tracking-tight',
    h2: 'text-3xl md:text-4xl font-bold tracking-tight',
    h3: 'text-2xl md:text-3xl font-semibold',
    h4: 'text-xl md:text-2xl font-semibold',

    // Body
    body: 'text-base leading-relaxed',
    bodyLarge: 'text-lg md:text-xl leading-relaxed',

    // Label
    label: 'text-sm font-medium uppercase tracking-wider',
} as const;

// ========================================
// 간격 시스템
// ========================================

export const spacing = {
    section: 'py-24 md:py-32 lg:py-40',
    sectionSmall: 'py-16 md:py-24',
    container: 'max-w-7xl mx-auto px-6 md:px-8',
} as const;
