import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js API Route Proxy
 *
 * Every request from the browser to /api/* is intercepted here
 * and forwarded to Laravel server-side.
 *
 * Why this exists:
 *   Browser runs on localhost:3000
 *   Laravel runs on localhost:8000
 *   httpOnly cookies set by Laravel on :8000 cannot be read
 *   by JavaScript on :3000 — different origins.
 *
 *   This proxy runs on the SERVER (not browser).
 *   Browser → Next.js proxy (same origin :3000) → Laravel (:8000)
 *   Cookies stay on :3000, forwarded to Laravel manually.
 *
 * How it works:
 *   1. Browser sends request to /api/v1/auth/login
 *   2. This proxy receives it
 *   3. Forwards it to http://localhost:8000/api/v1/auth/login
 *   4. Returns Laravel's response to the browser
 *   5. Any Set-Cookie headers from Laravel are passed through
 */

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000'

async function handler(request: NextRequest): Promise<NextResponse> {
  // Extract the path after /api/
  // e.g. /api/v1/auth/login → /v1/auth/login
  const path = request.nextUrl.pathname.replace('/api', '')
  const search = request.nextUrl.search

  const targetUrl = path.startsWith('/sanctum')
  ? `${LARAVEL_API_URL}${path}${search}`
  : `${LARAVEL_API_URL}/api${path}${search}`
  // Forward all cookies from the browser to Laravel
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.getAll()
    .map(c => `${c.name}=${c.value}`)
    .join('; ')

  // Forward all headers from the original request
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  })

  // Forward XSRF token if present
  const xsrfToken = cookieStore.get('XSRF-TOKEN')
  if (xsrfToken) {
    headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrfToken.value))
  }

  if (cookieHeader) {
    headers.set('Cookie', cookieHeader)
  }

  // Get request body for POST/PUT/PATCH requests
  let body: string | undefined
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    try {
      body = await request.text()
    } catch {
      body = undefined
    }
  }

  // Forward request to Laravel
  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    credentials: 'include',
  })

  // Sanctum CSRF returns 204 No Content — NextResponse rejects a body with 204
  const responseBody =
    response.status === 204 || response.status === 205
      ? null
      : await response.text()

  const nextResponse = new NextResponse(responseBody, {
    status: response.status,
    headers: {
      'Content-Type':
        response.headers.get('Content-Type') || 'application/json',
    },
  })

  // Forward all Set-Cookie headers from Laravel to the browser.
  // getSetCookie() preserves multiple cookies (XSRF-TOKEN + session).
  const setCookies =
    typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : []

  if (setCookies.length > 0) {
    for (const cookie of setCookies) {
      nextResponse.headers.append('Set-Cookie', cookie)
    }
  } else {
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        nextResponse.headers.append('Set-Cookie', value)
      }
    })
  }

  return nextResponse
}

// Handle all HTTP methods
export const GET     = handler
export const POST    = handler
export const PUT     = handler
export const PATCH   = handler
export const DELETE  = handler