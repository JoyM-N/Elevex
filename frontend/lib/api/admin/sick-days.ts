import apiClient from '@/lib/api/axios'
import type {
  ApiResponse,
  PaginatedResponse,
  SickDay,
  SickDayStatus,
} from '@/types'
import type { ReviewSickDayData } from '@/lib/validations/settings'

export async function listSickDays(params: {
  status?: SickDayStatus
  page?: number
} = {}): Promise<PaginatedResponse<SickDay>> {
  const response = await apiClient.get<PaginatedResponse<SickDay>>(
    '/v1/admin/sick-days',
    {
      params: Object.fromEntries(
        Object.entries(params).filter(([, v]) => v != null)
      ),
    }
  )
  return response.data
}

export async function reviewSickDay(
  id: number,
  data: ReviewSickDayData
): Promise<SickDay> {
  const response = await apiClient.patch<ApiResponse<SickDay>>(
    `/v1/admin/sick-days/${id}/review`,
    {
      action: data.action,
      notes: data.notes || null,
    }
  )
  return response.data.data
}
