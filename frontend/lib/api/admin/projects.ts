import apiClient from '@/lib/api/axios'
import type {
  ApiResponse,
  Milestone,
  PaginatedResponse,
  Project,
  ProjectPriority,
  ProjectStatus,
} from '@/types'
import type {
  AssignMembersFormData,
  MilestoneFormData,
  ProjectFormData,
} from '@/lib/validations/projects'

export type ProjectListParams = {
  status?: ProjectStatus | ''
  priority?: ProjectPriority | ''
  search?: string
  page?: number
  per_page?: number
}

export async function listProjects(
  params: ProjectListParams = {}
): Promise<PaginatedResponse<Project>> {
  const response = await apiClient.get<PaginatedResponse<Project>>(
    '/v1/admin/projects',
    { params: Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
    ) }
  )
  return response.data
}

export async function getProject(id: number): Promise<Project> {
  const response = await apiClient.get<ApiResponse<Project>>(
    `/v1/admin/projects/${id}`
  )
  return response.data.data
}

export async function createProject(data: ProjectFormData): Promise<Project> {
  const response = await apiClient.post<ApiResponse<Project>>(
    '/v1/admin/projects',
    data
  )
  return response.data.data
}

export async function updateProject(
  id: number,
  data: Partial<ProjectFormData>
): Promise<Project> {
  const response = await apiClient.put<ApiResponse<Project>>(
    `/v1/admin/projects/${id}`,
    data
  )
  return response.data.data
}

export async function deleteProject(id: number): Promise<void> {
  await apiClient.delete(`/v1/admin/projects/${id}`)
}

export async function assignProjectMembers(
  id: number,
  data: AssignMembersFormData
): Promise<Project> {
  const response = await apiClient.post<ApiResponse<Project>>(
    `/v1/admin/projects/${id}/members`,
    data
  )
  return response.data.data
}

export async function removeProjectMember(
  projectId: number,
  userId: number
): Promise<void> {
  await apiClient.delete(`/v1/admin/projects/${projectId}/members/${userId}`)
}

export async function listMilestones(projectId: number): Promise<Milestone[]> {
  const response = await apiClient.get<ApiResponse<Milestone[]>>(
    `/v1/admin/projects/${projectId}/milestones`
  )
  return response.data.data
}

export async function createMilestone(
  projectId: number,
  data: MilestoneFormData
): Promise<Milestone> {
  const response = await apiClient.post<ApiResponse<Milestone>>(
    `/v1/admin/projects/${projectId}/milestones`,
    data
  )
  return response.data.data
}

export async function updateMilestone(
  projectId: number,
  milestoneId: number,
  data: MilestoneFormData
): Promise<Milestone> {
  const response = await apiClient.put<ApiResponse<Milestone>>(
    `/v1/admin/projects/${projectId}/milestones/${milestoneId}`,
    data
  )
  return response.data.data
}

export async function deleteMilestone(
  projectId: number,
  milestoneId: number
): Promise<void> {
  await apiClient.delete(
    `/v1/admin/projects/${projectId}/milestones/${milestoneId}`
  )
}

export async function listInterns(params: {
  search?: string
  per_page?: number
} = {}): Promise<PaginatedResponse<import('@/types').User>> {
  const response = await apiClient.get<PaginatedResponse<import('@/types').User>>(
    '/v1/admin/interns',
    { params }
  )
  return response.data
}
