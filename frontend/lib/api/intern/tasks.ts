import apiClient from '@/lib/api/axios'
import type {
  ApiResponse,
  PaginatedResponse,
  Task,
  TaskPriority,
  TaskStatus,
  TaskType,
} from '@/types'
import type { CompleteTaskFormData } from '@/lib/validations/tasks'

export type InternTaskListParams = {
  status?: TaskStatus | ''
  priority?: TaskPriority | ''
  task_type?: TaskType | ''
  page?: number
  per_page?: number
}

export async function listInternTasks(
  params: InternTaskListParams = {}
): Promise<PaginatedResponse<Task>> {
  const response = await apiClient.get<PaginatedResponse<Task>>(
    '/v1/intern/tasks',
    {
      params: Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
      ),
    }
  )
  return response.data
}

export async function getInternTask(id: number): Promise<Task> {
  const response = await apiClient.get<ApiResponse<Task>>(
    `/v1/intern/tasks/${id}`
  )
  return response.data.data
}

export async function completeTask(
  id: number,
  data: CompleteTaskFormData
): Promise<Task> {
  const response = await apiClient.patch<ApiResponse<Task>>(
    `/v1/intern/tasks/${id}/complete`,
    data
  )
  return response.data.data
}
