'use client';

import { Variants } from 'framer-motion';

/**
 * GUIDEON Animation System
 * 
 * 부드럽고 세련된 모션 프리셋
 * 성능 최적화를 위해 transform과 opacity 위주 사용
 */

export const transitions = {
    spring: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1
    },
    smooth: {
        type: "tween",
        ease: [0.25, 0.1, 0.25, 1.0],
        duration: 0.5
    }
} as const;

export const variants: Record<string, Variants> = {
    container: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    },
    item: {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: transitions.smooth
        }
    },
    fadeInLeft: {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: transitions.smooth
        }
    },
    fadeInRight: {
        hidden: { opacity: 0, x: 20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: transitions.smooth
        }
    },
    scaleUp: {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: transitions.spring
        }
    }
};
