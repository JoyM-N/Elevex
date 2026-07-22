import apiClient from '@/lib/api/axios'
import type { AdminDashboard, ApiResponse } from '@/types'

/**
 * Admin Dashboard API
 *
 * Single endpoint that returns all widgets for the admin overview.
 */
export async function getAdminDashboard(): Promise<AdminDashboard> {
  const response = await apiClient.get<ApiResponse<AdminDashboard>>(
    '/v1/admin/dashboard'
  )
  return response.data.data
}
