'use client';

import { useState, FormEvent, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { HiOutlineLockClosed, HiOutlineShieldCheck, HiOutlineCheck, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import type { InviteAcceptStatus, InviteErrorType } from '@/features/invite/domain/entities/Invite';
import './InviteAcceptForm.css';

/**
 * InviteAcceptFormProps
 */
interface InviteAcceptFormProps {
    status: InviteAcceptStatus;
    errorType: InviteErrorType | null;
    errorMessage: string | null;
    onSubmit: (password: string) => void;
    onClearError: () => void;
}

/**
 * 비밀번호 강도 계산
 */
function getPasswordStrength(password: string): number {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 4) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(score, 4);
}

/**
 * 초대 수락 폼 컴포넌트
 *
 * 비밀번호 설정 → 계정 생성 → 자동 로그인
 */
export function InviteAcceptForm({
    status,
    errorType,
    errorMessage,
    onSubmit,
    onClearError,
}: InviteAcceptFormProps) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

    const isPasswordMatch = confirmPassword.length > 0 && password === confirmPassword;
    const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
    const isFormValid = password.length >= 4 && isPasswordMatch;

    const isSubmitting = status === 'submitting';

    /** 폼 제출 핸들러 */
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setValidationError('');

        if (password.length < 4) {
            setValidationError('비밀번호는 최소 4자 이상이어야 합니다.');
            return;
        }

        if (password !== confirmPassword) {
            setValidationError('비밀번호가 일치하지 않습니다.');
            return;
        }

        onSubmit(password);
    };

    /** 입력 변경 시 에러 초기화 */
    const handlePasswordChange = (value: string) => {
        setPassword(value);
        if (validationError) setValidationError('');
        if (errorMessage) onClearError();
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        if (validationError) setValidationError('');
    };

    /** 성공 화면 */
    if (status === 'success') {
        return (
            <div className="invite-page">
                <div className="invite-dots" />
                <div className={`invite-container ${mounted ? 'mounted' : ''}`}>
                    <div className="invite-ribbon" />
                    <div style={{ textAlign: 'center' }}>
                        <div className="invite-success-icon invite-anim" style={{ '--delay': 0 } as React.CSSProperties}>
                            <HiOutlineCheck />
                        </div>
                        <h2 className="invite-heading invite-anim" style={{ '--delay': 1, textAlign: 'center' } as React.CSSProperties}>
                            가입 완료!
                        </h2>
                        <p className="invite-subheading invite-anim" style={{ '--delay': 2, textAlign: 'center' } as React.CSSProperties}>
                            계정이 성공적으로 생성되었습니다.<br />
                            잠시 후 대시보드로 이동합니다.
                        </p>
                        <div className="invite-loading invite-anim" style={{ '--delay': 3 } as React.CSSProperties}>
                            <div className="invite-loading-spinner" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /** 만료/이미수락 등 복구 불가 에러 화면 */
    if (status === 'error' && (errorType === 'INVITE_EXPIRED' || errorType === 'INVITE_ALREADY_USED' || errorType === 'NOT_FOUND')) {
        return (
            <div className="invite-page">
                <div className="invite-dots" />
                <div className={`invite-container ${mounted ? 'mounted' : ''}`}>
                    <div className="invite-ribbon" />
                    <div style={{ textAlign: 'center' }}>
                        <div className="invite-error-icon invite-anim" style={{ '--delay': 0, margin: '0 auto 24px' } as React.CSSProperties}>
                            <HiOutlineExclamationTriangle />
                        </div>
                        <h2 className="invite-heading invite-anim" style={{ '--delay': 1, textAlign: 'center' } as React.CSSProperties}>
                            {errorType === 'INVITE_EXPIRED' && '초대가 만료되었습니다'}
                            {errorType === 'INVITE_ALREADY_USED' && '이미 수락된 초대입니다'}
                            {errorType === 'NOT_FOUND' && '유효하지 않은 링크입니다'}
                        </h2>
                        <p className="invite-subheading invite-anim" style={{ '--delay': 2, textAlign: 'center' } as React.CSSProperties}>
                            {errorMessage}
                        </p>
                        <div className="invite-anim" style={{ '--delay': 3 } as React.CSSProperties}>
                            <Link
                                href="/login"
                                className="invite-submit-btn"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                            >
                                로그인 페이지로 이동
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /** 비밀번호 입력 폼 */
    return (
        <div className="invite-page">
            <div className="invite-dots" />

            <div className={`invite-container ${mounted ? 'mounted' : ''}`}>
                <div className="invite-ribbon" />

                {/* Badge */}
                <div className="invite-badge invite-anim" style={{ '--delay': 0 } as React.CSSProperties}>
                    <span className="badge-dot" />
                    GUIDEON
                </div>

                {/* Icon */}
                <div className="invite-icon-container invite-anim" style={{ '--delay': 1 } as React.CSSProperties}>
                    <HiOutlineShieldCheck />
                </div>

                {/* Heading */}
                <h2 className="invite-heading invite-anim" style={{ '--delay': 2 } as React.CSSProperties}>
                    환영합니다!
                </h2>
                <p className="invite-subheading invite-anim" style={{ '--delay': 3 } as React.CSSProperties}>
                    <span className="highlight">GUIDEON</span> 운영자로 초대되었습니다.<br />
                    비밀번호를 설정하고 시작하세요.
                </p>

                <div className="invite-divider invite-anim" style={{ '--delay': 4 } as React.CSSProperties} />

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <p className="invite-section-label invite-anim" style={{ '--delay': 4 } as React.CSSProperties}>
                        비밀번호 설정
                    </p>

                    {/* Password */}
                    <div className="invite-input-box invite-anim" style={{ '--delay': 5 } as React.CSSProperties}>
                        <input
                            type="password"
                            id="invite-password"
                            value={password}
                            onChange={(event) => handlePasswordChange(event.target.value)}
                            placeholder=" "
                            required
                            minLength={4}
                            disabled={isSubmitting}
                        />
                        <label htmlFor="invite-password">비밀번호</label>
                        <HiOutlineLockClosed className="invite-input-icon" />
                    </div>

                    {/* Password Strength */}
                    {password.length > 0 && (
                        <div className="password-strength invite-anim" style={{ '--delay': 5 } as React.CSSProperties}>
                            {[1, 2, 3, 4].map((level) => (
                                <div
                                    key={level}
                                    className={`strength-bar ${
                                        passwordStrength >= level
                                            ? passwordStrength <= 2
                                                ? 'active'
                                                : passwordStrength === 3
                                                    ? 'medium'
                                                    : 'strong'
                                            : ''
                                    }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Confirm Password */}
                    <div className="invite-input-box invite-anim" style={{ '--delay': 6 } as React.CSSProperties}>
                        <input
                            type="password"
                            id="invite-confirm-password"
                            value={confirmPassword}
                            onChange={(event) => handleConfirmPasswordChange(event.target.value)}
                            placeholder=" "
                            required
                            minLength={4}
                            disabled={isSubmitting}
                        />
                        <label htmlFor="invite-confirm-password">비밀번호 확인</label>
                        <HiOutlineLockClosed className="invite-input-icon" />
                    </div>

                    {/* Matching Hint */}
                    {isPasswordMatch && (
                        <p className="invite-hint valid">
                            <HiOutlineCheck size={14} />
                            비밀번호가 일치합니다
                        </p>
                    )}
                    {isPasswordMismatch && (
                        <p className="invite-hint error">
                            비밀번호가 일치하지 않습니다
                        </p>
                    )}

                    {/* Validation Error */}
                    {validationError && (
                        <div className="invite-error-card" role="alert" aria-live="polite">
                            {validationError}
                        </div>
                    )}

                    {/* API Error (recoverable) */}
                    {errorMessage && status === 'error' && errorType !== 'INVITE_EXPIRED' && errorType !== 'INVITE_ALREADY_USED' && errorType !== 'NOT_FOUND' && (
                        <div className="invite-error-card" role="alert" aria-live="polite">
                            {errorMessage}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                        className="invite-submit-btn invite-anim"
                        style={{ '--delay': 7 } as React.CSSProperties}
                    >
                        {isSubmitting ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <svg className="invite-spinner" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                계정 생성 중...
                            </span>
                        ) : '시작하기'}
                    </button>

                    {/* Login Link */}
                    <div className="invite-login-link invite-anim" style={{ '--delay': 8 } as React.CSSProperties}>
                        이미 계정이 있으신가요? <Link href="/login">로그인</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
