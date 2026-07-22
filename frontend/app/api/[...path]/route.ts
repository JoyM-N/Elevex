import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js API Route Proxy
 *
 * Every request from the browser to /api/* is intercepted here
 * and forwarded to Laravel server-side.
 */

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000'

async function handler(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname.replace('/api', '')
  const search = request.nextUrl.search

  const targetUrl = path.startsWith('/sanctum')
    ? `${LARAVEL_API_URL}${path}${search}`
    : `${LARAVEL_API_URL}/api${path}${search}`

  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  const incomingContentType = request.headers.get('content-type') || ''
  const isMultipart = incomingContentType.includes('multipart/form-data')

  const headers = new Headers({
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  })

  // Only force JSON content-type for non-multipart bodies
  if (!isMultipart) {
    headers.set('Content-Type', 'application/json')
  } else {
    headers.set('Content-Type', incomingContentType)
  }

  const xsrfToken = cookieStore.get('XSRF-TOKEN')
  if (xsrfToken) {
    headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrfToken.value))
  }

  if (cookieHeader) {
    headers.set('Cookie', cookieHeader)
  }

  let body: BodyInit | undefined
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    try {
      body = isMultipart
        ? await request.arrayBuffer()
        : await request.text()
    } catch {
      body = undefined
    }
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    credentials: 'include',
  })

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

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
