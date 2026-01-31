'use client';

import { useMemo } from 'react';

/**
 * ParticlesContainer
 */
export function ParticlesContainer() {
    // 파티클 데이터 생성
    const particles = useMemo(() =>
        Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            size: (i % 8) + 2,
            left: (i * 2.5) % 100,
            top: (i * 7.3) % 100,
            delay: (i * 0.3) % 5,
            duration: 10 + (i % 10),
        })),
        []);

    return (
        <div className="w-full h-full absolute inset-0 overflow-hidden pointer-events-none">
            {/* 파티클 */}
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full bg-[#FF6B52] opacity-30 animate-float"
                    style={{
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                    }}
                />
            ))}

            {/* 연결선 시뮬레이션 */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
            radial-gradient(circle at 20% 30%, rgba(255, 107, 82, 0.1) 0%, transparent 30%),
            radial-gradient(circle at 80% 60%, rgba(255, 107, 82, 0.08) 0%, transparent 25%),
            radial-gradient(circle at 50% 80%, rgba(255, 107, 82, 0.06) 0%, transparent 20%)
          `,
                }}
            />
        </div>
    );
}
