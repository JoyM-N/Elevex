import apiClient from '@/lib/api/axios'
import type {
  ApiResponse,
  User,
} from '@/types'
import type {
  LoginFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  ChangePasswordFormData,
} from '@/lib/validations/auth'

/**
 * Auth API Functions
 *
 * All authentication API calls in one place.
 * Called by TanStack Query mutations in components.
 *
 * CSRF flow:
 *   Before login we fetch /sanctum/csrf-cookie.
 *   This sets the XSRF-TOKEN cookie.
 *   Our proxy reads it and forwards it as X-XSRF-TOKEN header.
 *   Laravel validates it and allows the login request.
 */

/**
 * Fetch CSRF cookie from Laravel.
 * Must be called before any state-changing request (login etc.)
 */
export async function getCsrfCookie(): Promise<void> {
    // CSRF cookie lives outside /api — use fetch directly
    await fetch('/api/sanctum/csrf-cookie', {
      credentials: 'include',
    })
  }

/**
 * Login with email and password.
 * Fetches CSRF cookie first, then submits credentials.
 *
 * Laravel wraps the payload as:
 *   { data: { user, token, token_type } }
 */
export async function login(data: LoginFormData): Promise<User> {
  await getCsrfCookie()
  const response = await apiClient.post<
    ApiResponse<{ user: User; token: string; token_type: string }>
  >('/v1/auth/login', data)
  return response.data.data.user
}

/**
 * Logout the authenticated user.
 * Invalidates the session on the Laravel side.
 */
export async function logout(): Promise<void> {
  await apiClient.post('/v1/auth/logout')
}

/**
 * Get the currently authenticated user.
 * Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>('/v1/auth/user')
  return response.data.data
}

/**
 * Send a password reset link to the given email.
 */
export async function forgotPassword(data: ForgotPasswordFormData): Promise<void> {
  await getCsrfCookie()
  await apiClient.post('/v1/auth/forgot-password', data)
}

/**
 * Reset password using token from email.
 */
export async function resetPassword(data: ResetPasswordFormData): Promise<void> {
  await getCsrfCookie()
  await apiClient.post('/v1/auth/reset-password', data)
}

/**
 * Change password for authenticated user.
 */
export async function changePassword(data: ChangePasswordFormData): Promise<void> {
  await apiClient.put('/v1/auth/password', data)
}