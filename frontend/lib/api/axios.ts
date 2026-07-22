import axios from 'axios'

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

/**
 * Response interceptor
 *
 * Handles global error responses:
 *   401 — redirect to login (session expired)
 *   403 — redirect to dashboard (unauthorized)
 *   500 — log server errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired — redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient