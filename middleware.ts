import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/admin-auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin routes
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  // Let the login page and login/logout API through unauthenticated
  if (pathname === '/admin' ||
      pathname === '/api/admin/login' ||
      pathname === '/api/admin/logout') {
    return NextResponse.next();
  }

  // All other /admin/* and /api/admin/* routes require a valid token
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token && await verifyToken(token)) return NextResponse.next();

  // API routes — return 401 rather than redirecting
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Page routes — redirect to login
  const loginUrl = new URL('/admin', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
