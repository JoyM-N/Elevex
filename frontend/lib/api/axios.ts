import axios from 'axios'
import { clearSessionHint } from '@/lib/auth/session-hint'

/**
 * Axios Instance
 *
 * Configured to talk to our Next.js proxy layer.
 * Base URL is /api so all requests go through the proxy
 * and never directly to Laravel from the browser.
 *
 * withCredentials: true — sends cookies with every request.
 * This is required for Sanctum SPA authentication.
 *
 * The proxy handles forwarding cookies to Laravel server-side.
 */
const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

const AUTH_PAGE_PREFIXES = ['/login', '/forgot-password', '/reset-password']

let clearingSession = false

async function clearStaleSessionCookies() {
  if (clearingSession) return
  clearingSession = true
  clearSessionHint()
  try {
    await fetch('/api/auth/clear-session', {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // Best-effort — still continue with reject/redirect
  } finally {
    clearingSession = false
  }
}

function shouldHardRedirectOn401(): boolean {
  if (typeof window === 'undefined') return false

  const path = window.location.pathname
  if (path === '/') return false
  if (AUTH_PAGE_PREFIXES.some((prefix) => path.startsWith(prefix))) return false

  return true
}

/**
 * Response interceptor
 *
 * 401 → clear stale cookies, then hard-redirect away from protected pages.
 * Skips home/auth pages so callers can soft-navigate without looping.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearStaleSessionCookies()

      if (shouldHardRedirectOn401()) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
