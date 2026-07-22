import apiClient from '@/lib/api/axios'
import { getNotificationApiPrefix } from '@/lib/auth/roles'
import type {
  ApiResponse,
  Notification,
  PaginatedResponse,
  UserRole,
} from '@/types'

function prefix(role: UserRole | undefined) {
  return getNotificationApiPrefix(role)
}

export async function getUnreadCount(
  role: UserRole | undefined
): Promise<number> {
  const response = await apiClient.get<ApiResponse<{ count: number }>>(
    `${prefix(role)}/notifications/unread-count`
  )
  return response.data.data.count
}

export async function listNotifications(
  role: UserRole | undefined,
  page = 1
): Promise<PaginatedResponse<Notification>> {
  const response = await apiClient.get<PaginatedResponse<Notification>>(
    `${prefix(role)}/notifications`,
    { params: { page } }
  )
  return response.data
}

export async function markNotificationRead(
  role: UserRole | undefined,
  id: string
): Promise<void> {
  await apiClient.patch(`${prefix(role)}/notifications/${id}/read`)
}

export async function markAllNotificationsRead(
  role: UserRole | undefined
): Promise<void> {
  await apiClient.patch(`${prefix(role)}/notifications/read-all`)
}
