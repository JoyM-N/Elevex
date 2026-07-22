import apiClient from '@/lib/api/axios'
import type {
  ApiResponse,
  PaginatedResponse,
  SickDay,
  SickDayStatus,
} from '@/types'
import type { RequestSickDayData } from '@/lib/validations/settings'

export async function listMySickDays(params: {
  status?: SickDayStatus
  page?: number
} = {}): Promise<PaginatedResponse<SickDay>> {
  const response = await apiClient.get<PaginatedResponse<SickDay>>(
    '/v1/intern/sick-days',
    {
      params: Object.fromEntries(
        Object.entries(params).filter(([, v]) => v != null)
      ),
    }
  )
  return response.data
}

export async function requestSickDay(
  data: RequestSickDayData
): Promise<SickDay> {
  const response = await apiClient.post<ApiResponse<SickDay>>(
    '/v1/intern/sick-days',
    {
      date: data.date,
      reason: data.reason || null,
    }
  )
  return response.data.data
}
