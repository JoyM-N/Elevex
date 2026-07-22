import type { User, UserRole } from '@/types'

/**
 * Role helpers for redirects and API prefixes.
 */

export function getDashboardHome(role: UserRole | undefined): string {
  if (role === 'intern') return '/intern/dashboard'
  return '/admin/dashboard'
}

export function getNotificationApiPrefix(role: UserRole | undefined): '/v1/admin' | '/v1/intern' {
  if (role === 'intern') return '/v1/intern'
  return '/v1/admin'
}

export function isAdminRole(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function userInitials(user: User | undefined): string {
  if (!user?.name) return '?'
  return user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
