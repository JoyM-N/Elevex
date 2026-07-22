import apiClient from '@/lib/api/axios'
import type {
  Achievement,
  ApiResponse,
  Evaluation,
  PerformanceMetric,
  Skill,
} from '@/types'
import type {
  CreateEvaluationData,
  EndorseSkillData,
  UpdateEvaluationData,
} from '@/lib/validations/performance'

export async function getInternPerformance(
  userId: number
): Promise<PerformanceMetric | null> {
  try {
    const response = await apiClient.get<ApiResponse<PerformanceMetric>>(
      `/v1/admin/interns/${userId}/performance`
    )
    return response.data.data
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status
    if (status === 404) return null
    throw error
  }
}

export async function recalculateInternPerformance(userId: number): Promise<{
  metrics: PerformanceMetric
  new_achievements: unknown
}> {
  const response = await apiClient.post<
    ApiResponse<{ metrics: PerformanceMetric; new_achievements: unknown }>
  >(`/v1/admin/interns/${userId}/performance/recalculate`)
  return response.data.data
}

export async function getInternAchievements(
  userId: number
): Promise<Achievement[]> {
  const response = await apiClient.get<ApiResponse<Achievement[]>>(
    `/v1/admin/interns/${userId}/achievements`
  )
  return response.data.data
}

export async function listEvaluations(params: {
  user_id?: number
} = {}): Promise<Evaluation[]> {
  const response = await apiClient.get<ApiResponse<Evaluation[]>>(
    '/v1/admin/evaluations',
    { params }
  )
  return response.data.data
}

export async function getEvaluation(id: number): Promise<Evaluation> {
  const response = await apiClient.get<ApiResponse<Evaluation>>(
    `/v1/admin/evaluations/${id}`
  )
  return response.data.data
}

export async function createEvaluation(
  data: CreateEvaluationData
): Promise<Evaluation> {
  const response = await apiClient.post<ApiResponse<Evaluation>>(
    '/v1/admin/evaluations',
    { ...data, remarks: data.remarks || null }
  )
  return response.data.data
}

export async function updateEvaluation(
  id: number,
  data: UpdateEvaluationData
): Promise<Evaluation> {
  const response = await apiClient.put<ApiResponse<Evaluation>>(
    `/v1/admin/evaluations/${id}`,
    { ...data, remarks: data.remarks || null }
  )
  return response.data.data
}

export async function listSkillsCatalog(): Promise<Skill[]> {
  const response = await apiClient.get<ApiResponse<Skill[]>>('/v1/admin/skills')
  return response.data.data
}

export async function getInternSkills(userId: number): Promise<Skill[]> {
  const response = await apiClient.get<ApiResponse<Skill[]>>(
    `/v1/admin/interns/${userId}/skills`
  )
  return response.data.data
}

export async function endorseInternSkill(
  userId: number,
  data: EndorseSkillData
): Promise<void> {
  await apiClient.post(`/v1/admin/interns/${userId}/skills/endorse`, data)
}
