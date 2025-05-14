import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isAuthenticated = !!req.nextauth.token;

    // If user is authenticated and tries to access /sign-in, redirect to /dashboard
    if (isAuthenticated && pathname === '/sign-in') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // If user is not authenticated and tries to access anything except /sign-in or /api/auth, redirect to /sign-in
    if (
      !isAuthenticated &&
      pathname !== '/sign-in' &&
      !pathname.startsWith('/api/auth')
    ) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ['/((?!api/auth|sign-in|_next/static|_next/image|favicon.ico).*)'],
};
