import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');

    // If user has no token and is trying to access protected routes (not login/signup)
    if (!token && !isAuthRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If user is logged in, don't let them see the login/signup pages
    if (token && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/chat/:path*', '/test/:path*', '/login', '/signup'],
}