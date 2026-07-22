import apiClient from '@/lib/api/axios'
import type { Achievement, ApiResponse, PerformanceMetric, Skill } from '@/types'
import type { AssignSkillData } from '@/lib/validations/performance'

export async function getMyPerformance(): Promise<PerformanceMetric | null> {
  const response = await apiClient.get<ApiResponse<PerformanceMetric | null>>(
    '/v1/intern/performance'
  )
  return response.data.data ?? null
}

export async function getMyAchievements(): Promise<Achievement[]> {
  const response = await apiClient.get<ApiResponse<Achievement[]>>(
    '/v1/intern/achievements'
  )
  return response.data.data ?? []
}

export async function listAvailableSkills(): Promise<Skill[]> {
  const response = await apiClient.get<ApiResponse<Skill[]>>('/v1/intern/skills')
  return response.data.data ?? []
}

export async function getMySkills(): Promise<Skill[]> {
  const response = await apiClient.get<ApiResponse<Skill[]>>(
    '/v1/intern/skills/mine'
  )
  return response.data.data ?? []
}

export async function assignMySkill(data: AssignSkillData): Promise<void> {
  await apiClient.post('/v1/intern/skills', data)
}

export async function removeMySkill(skillId: number): Promise<void> {
  await apiClient.delete(`/v1/intern/skills/${skillId}`)
}
