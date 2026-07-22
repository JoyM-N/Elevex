import type { Notification, UserRole } from '@/types'
import { isAdminRole } from '@/lib/auth/roles'

/**
 * Resolve a deep-link for a notification, when we have enough data.
 */
export function notificationHref(
  notification: Notification,
  role: UserRole | undefined
): string | null {
  const data = notification.data ?? {}
  const type = notification.type || (data.type as string | undefined)
  const admin = isAdminRole(role)

  switch (type) {
    case 'task_assigned': {
      const taskId = data.task_id
      if (typeof taskId === 'number' || typeof taskId === 'string') {
        return admin
          ? `/admin/tasks/${taskId}`
          : `/intern/tasks/${taskId}`
      }
      return admin ? '/admin/tasks' : '/intern/tasks'
    }
    case 'logbook_status_changed': {
      const logbookId = data.logbook_id
      if (typeof logbookId === 'number' || typeof logbookId === 'string') {
        return admin
          ? `/admin/logbooks`
          : `/intern/logbooks/${logbookId}`
      }
      return admin ? '/admin/logbooks' : '/intern/logbooks'
    }
    case 'recommendation_status_changed':
      return admin ? '/admin/recommendations' : '/intern/recommendations'
    case 'sick_day_status_changed':
      return admin ? '/admin/settings' : '/intern/profile'
    default:
      return null
  }
}

export function notificationsListPath(role: UserRole | undefined): string {
  return isAdminRole(role) ? '/admin/notifications' : '/intern/notifications'
}

export function formatNotificationRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
