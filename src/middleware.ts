import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/', '/invite'];

/**
 * 서버 레벨 라우트 보호 미들웨어
 * - /admin/** 경로: accessToken 쿠키/localStorage 없으면 /login으로 리다이렉트
 * - /login 경로: accessToken 있으면 /admin으로 리다이렉트
 *
 * Note: localStorage는 서버에서 접근 불가하므로 쿠키 기반 체크는 불가.
 * accessToken 존재 여부만 확인하는 가벼운 가드 역할이며,
 * 실제 토큰 유효성 검증은 클라이언트 AuthGuard에서 수행.
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get('accessToken')?.value;

    const isPublicPath = PUBLIC_PATHS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
    const isAdminPath = pathname.startsWith('/admin');

    // 인증 없이 admin 접근 시 로그인으로 리다이렉트
    if (isAdminPath && !accessToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 인증된 상태에서 로그인 페이지 접근 시 admin으로 리다이렉트
    if (pathname === '/login' && accessToken) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
