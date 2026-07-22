import apiClient from '@/lib/api/axios'
import type {
  ApiResponse,
  PaginatedResponse,
  Task,
  TaskPriority,
  TaskStatus,
  TaskType,
} from '@/types'
import type {
  CreateTaskFormData,
  UpdateTaskFormData,
} from '@/lib/validations/tasks'

export type TaskListParams = {
  status?: TaskStatus | ''
  priority?: TaskPriority | ''
  task_type?: TaskType | ''
  search?: string
  milestone_id?: number
  page?: number
  per_page?: number
}

function cleanParams(params: TaskListParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
  )
}

export async function listAdminTasks(
  params: TaskListParams = {}
): Promise<PaginatedResponse<Task>> {
  const response = await apiClient.get<PaginatedResponse<Task>>(
    '/v1/admin/tasks',
    { params: cleanParams(params) }
  )
  return response.data
}

export async function getAdminTask(id: number): Promise<Task> {
  const response = await apiClient.get<ApiResponse<Task>>(
    `/v1/admin/tasks/${id}`
  )
  return response.data.data
}

export async function createTask(data: CreateTaskFormData): Promise<Task> {
  const payload = {
    title: data.title,
    description: data.description || null,
    task_type: data.task_type,
    priority: data.priority,
    assigned_to: data.assigned_to,
    estimated_hours: data.estimated_hours ?? null,
    deadline: data.deadline || null,
    ...(data.task_type === 'project_task'
      ? { milestone_id: data.milestone_id }
      : {}),
  }
  const response = await apiClient.post<ApiResponse<Task>>(
    '/v1/admin/tasks',
    payload
  )
  return response.data.data
}

export async function updateTask(
  id: number,
  data: UpdateTaskFormData
): Promise<Task> {
  const response = await apiClient.put<ApiResponse<Task>>(
    `/v1/admin/tasks/${id}`,
    {
      ...data,
      description: data.description || null,
      estimated_hours: data.estimated_hours ?? null,
      deadline: data.deadline || null,
    }
  )
  return response.data.data
}

export async function deleteTask(id: number): Promise<void> {
  await apiClient.delete(`/v1/admin/tasks/${id}`)
}
