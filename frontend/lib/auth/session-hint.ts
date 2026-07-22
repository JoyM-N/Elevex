/**
 * Client-readable session hint.
 *
 * Sanctum session cookies are httpOnly, so JS cannot see them.
 * This non-httpOnly flag lets us skip /auth/user on public pages
 * when the user is clearly logged out (avoids noisy 401s).
 */

export const SESSION_HINT_COOKIE = 'elevex_auth'

export function hasSessionHint(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie
    .split(';')
    .some((part) => part.trim().startsWith(`${SESSION_HINT_COOKIE}=1`))
}

export function setSessionHint(): void {
  if (typeof document === 'undefined') return
  // 2 hours — matches typical Sanctum session window in local/dev
  document.cookie = `${SESSION_HINT_COOKIE}=1; path=/; SameSite=Lax; max-age=7200`
}

export function clearSessionHint(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${SESSION_HINT_COOKIE}=; path=/; SameSite=Lax; max-age=0`
}

export function shouldFetchAuthUser(): boolean {
  if (typeof window === 'undefined') return false

  const path = window.location.pathname
  const isAuthPage =
    path.startsWith('/login') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password')
  const isHome = path === '/'

  // Public pages: only probe Laravel if we previously marked a session
  if (isAuthPage || isHome) {
    return hasSessionHint()
  }

  // Dashboard / protected UI always resolve the user
  return true
}
