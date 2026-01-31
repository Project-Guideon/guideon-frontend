'use client';

import { useState, FormEvent, useEffect } from 'react';
import { HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2';
import { LoginFormProps } from '../types/LoginFormProps';
import './LoginForm.css';

export function LoginForm({
    onSubmit,
    isLoading = false,
    errorMessage = null,
}: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mounted, setMounted] = useState(false);

    // 마운트 후 애니메이션 시작
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (onSubmit) {
            await onSubmit(email, password);
        }
    };

    return (
        <div className="login-page">
            {/* Background Pattern */}
            <div className="decorative-dots" />

            {/* Main Container */}
            <div className={`login-container ${mounted ? 'mounted' : ''}`}>

                {/* Curved Shape 배경 */}
                <div className="curved-shape" />
                <div className="curved-shape2" />

                {/* Floating Elements */}
                <div className="floating-element el1" />
                <div className="floating-element el2" />
                <div className="floating-element el3" />

                {/* 좌측 - 로그인 폼 */}
                <div className="form-box">
                    <h2 className="animation" style={{ '--delay': 0 } as React.CSSProperties}>
                        Welcome
                    </h2>
                    <p className="form-subtitle animation" style={{ '--delay': 1 } as React.CSSProperties}>
                        GUIDEON 관리자 계정으로 로그인하세요
                    </p>

                    <form onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div className="input-box animation" style={{ '--delay': 2 } as React.CSSProperties}>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder=" "
                                required
                            />
                            <label htmlFor="email">Email</label>
                            <HiOutlineEnvelope className="input-icon" />
                        </div>

                        {/* Password Input */}
                        <div className="input-box animation" style={{ '--delay': 3 } as React.CSSProperties}>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder=" "
                                required
                            />
                            <label htmlFor="password">Password</label>
                            <HiOutlineLockClosed className="input-icon" />
                        </div>

                        {/* Forgot Password */}
                        <span className="forgot-link animation" style={{ '--delay': 4 } as React.CSSProperties}>
                            비밀번호를 잊으셨나요?
                        </span>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="error-message">
                                {errorMessage}
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="login-btn animation"
                            style={{ '--delay': 5 } as React.CSSProperties}
                        >
                            {isLoading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                    로그인 중...
                                </span>
                            ) : 'Sign In'}
                        </button>

                        {/* 초대 안내 */}
                        <div className="info-link animation" style={{ '--delay': 6 } as React.CSSProperties}>
                            <p>
                                계정이 필요하신가요?<br />
                                <span className="invite-link">관리자에게 초대를 요청하세요</span>
                            </p>
                        </div>
                    </form>
                </div>

                {/* 우측 - Welcome 메시지 */}
                <div className="info-content">
                    <div className="brand-badge animation" style={{ '--delay': 0 } as React.CSSProperties}>
                        <span className="dot" />
                        GUIDEON Admin
                    </div>
                    <h2 className="animation" style={{ '--delay': 1 } as React.CSSProperties}>
                        Hello,<br />Friend!
                    </h2>
                    <p className="animation" style={{ '--delay': 2 } as React.CSSProperties}>
                        스마트 관광 안내 시스템의 관리자 페이지에 오신 것을 환영합니다.
                        AI 기반 키오스크를 손쉽게 관리하세요.
                    </p>
                </div>

            </div>
        </div>
    );
}

export default LoginForm;
