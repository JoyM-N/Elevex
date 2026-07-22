import { redirect } from 'next/navigation'

/**
 * Root page — redirects to login.
 * The middleware handles redirecting authenticated users
 * to their dashboard. Unauthenticated users land on login.
 */
export default function Home() {
  redirect('/login')
}