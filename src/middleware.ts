import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const cookie = request.cookies.get('auth_token');
    const session = cookie ? await decrypt(cookie.value) : null;

    const isLoginPage = request.nextUrl.pathname === '/login';
    const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname === '/';

    // If user is not authenticated and tries to access dashboard or root
    if (!session && isDashboardPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If user is authenticated and tries to access login page
    if (session && isLoginPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
