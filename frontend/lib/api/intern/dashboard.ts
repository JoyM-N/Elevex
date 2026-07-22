import apiClient from '@/lib/api/axios'
import type { ApiResponse, InternDashboard } from '@/types'

/**
 * Intern Dashboard API
 *
 * Single endpoint that returns all widgets for the intern overview.
 */
export async function getInternDashboard(): Promise<InternDashboard> {
  const response = await apiClient.get<ApiResponse<InternDashboard>>(
    '/v1/intern/dashboard'
  )
  return response.data.data
}
