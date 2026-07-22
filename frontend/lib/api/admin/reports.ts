import apiClient from '@/lib/api/axios'
import type {
  ApiResponse,
  MonthlyReport,
  PerformanceReport,
  WeeklyReport,
} from '@/types'

export async function getWeeklyReport(params: {
  week_start?: string
} = {}): Promise<WeeklyReport> {
  const response = await apiClient.get<ApiResponse<WeeklyReport>>(
    '/v1/admin/reports/weekly',
    { params }
  )
  return response.data.data
}

export async function getMonthlyReport(params: {
  year?: number
  month?: number
} = {}): Promise<MonthlyReport> {
  const response = await apiClient.get<ApiResponse<MonthlyReport>>(
    '/v1/admin/reports/monthly',
    { params }
  )
  return response.data.data
}

export async function getPerformanceReport(
  userId: number
): Promise<PerformanceReport> {
  const response = await apiClient.get<ApiResponse<PerformanceReport>>(
    `/v1/admin/reports/performance/${userId}`
  )
  return response.data.data
}
