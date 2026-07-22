import { NextResponse } from 'next/server'

/**
 * Clears Sanctum/session cookies that may be stale.
 * Used after a 401 so the proxy stops treating the user as authenticated.
 */
export async function POST() {
  const response = NextResponse.json({ success: true })

  const expired = {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  }

  response.cookies.set('elevex-api-session', '', expired)
  response.cookies.set('laravel_session', '', expired)
  response.cookies.set('XSRF-TOKEN', '', {
    httpOnly: false,
    path: '/',
    maxAge: 0,
  })
  response.cookies.set('elevex_auth', '', {
    httpOnly: false,
    path: '/',
    maxAge: 0,
  })

  return response
}
