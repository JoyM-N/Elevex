import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js Middleware
 *
 * Runs on every request BEFORE the page renders.
 * Handles route protection at the edge.
 *
 * Protected routes: /admin/* and /intern/*
 * Public routes: /login, /forgot-password, /reset-password
 *
 * How it works:
 *   Checks for the Laravel session cookie.
 *   If missing on a protected route → redirect to login.
 *   If present on auth pages → redirect to dashboard.
 *
 * Note: This is a lightweight check — it only verifies
 * the cookie EXISTS, not that it's valid. The actual
 * auth check happens when the page fetches /auth/user.
 * If that returns 401, the axios interceptor redirects to login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for Laravel session cookie.
  // Default name is "{slug(APP_NAME)}-session" (e.g. elevex-api-session),
  // not the generic laravel_session unless SESSION_COOKIE is set that way.
  const sessionCookie =
    request.cookies.get('elevex-api-session') ||
    request.cookies.get('laravel_session')
  const isAuthenticated = !!sessionCookie

  // Routes that require authentication
  const protectedPaths = ['/admin', '/intern']
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path))

  // Auth pages (should not be accessible when logged in)
  const authPaths = ['/login', '/forgot-password', '/reset-password']
  const isAuthRoute = authPaths.some(path => pathname.startsWith(path))

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     *   - api routes (handled by proxy)
     *   - _next/static (static files)
     *   - _next/image (image optimization)
     *   - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}