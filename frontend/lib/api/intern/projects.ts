import apiClient from '@/lib/api/axios'
import type { ApiResponse, PaginatedResponse, Project } from '@/types'

export async function listInternProjects(params: {
  page?: number
  per_page?: number
} = {}): Promise<PaginatedResponse<Project>> {
  const response = await apiClient.get<PaginatedResponse<Project>>(
    '/v1/intern/projects',
    { params }
  )
  return response.data
}

export async function getInternProject(id: number): Promise<Project> {
  const response = await apiClient.get<ApiResponse<Project>>(
    `/v1/intern/projects/${id}`
  )
  return response.data.data
}
