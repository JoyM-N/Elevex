import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js Proxy (formerly Middleware)
 *
 * Cookie-only edge guard (cannot know role or validity here).
 *
 * Protected: /admin/*, /intern/*
 * Does NOT bounce auth pages when a cookie exists — a stale
 * elevex-api-session would otherwise loop: / → 401 → /login → /.
 * Valid sessions are redirected from auth pages by the login page client.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const sessionCookie =
    request.cookies.get('elevex-api-session') ||
    request.cookies.get('laravel_session')
  const isAuthenticated = !!sessionCookie

  const protectedPaths = ['/admin', '/intern']
  const isProtectedRoute = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
