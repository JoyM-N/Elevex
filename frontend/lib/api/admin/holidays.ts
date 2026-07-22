import apiClient from '@/lib/api/axios'
import type { ApiResponse, PublicHoliday } from '@/types'
import type { CreateHolidayData } from '@/lib/validations/settings'

export async function listPublicHolidays(params: {
  year?: number
} = {}): Promise<PublicHoliday[]> {
  const response = await apiClient.get<ApiResponse<PublicHoliday[]>>(
    '/v1/admin/public-holidays',
    { params }
  )
  return response.data.data
}

export async function createPublicHoliday(
  data: CreateHolidayData
): Promise<PublicHoliday> {
  const response = await apiClient.post<ApiResponse<PublicHoliday>>(
    '/v1/admin/public-holidays',
    {
      date: data.date,
      name: data.name,
      country: data.country || 'KE',
    }
  )
  return response.data.data
}

export async function updatePublicHoliday(
  id: number,
  data: Partial<CreateHolidayData>
): Promise<PublicHoliday> {
  const response = await apiClient.put<ApiResponse<PublicHoliday>>(
    `/v1/admin/public-holidays/${id}`,
    data
  )
  return response.data.data
}

export async function deletePublicHoliday(id: number): Promise<void> {
  await apiClient.delete(`/v1/admin/public-holidays/${id}`)
}
