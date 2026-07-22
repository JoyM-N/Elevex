import apiClient from '@/lib/api/axios'
import type { ApiResponse, RecommendationLetter, RecommendationStatus } from '@/types'

export async function listRecommendations(params: {
  status?: RecommendationStatus
} = {}): Promise<RecommendationLetter[]> {
  const response = await apiClient.get<ApiResponse<RecommendationLetter[]>>(
    '/v1/admin/recommendations',
    { params }
  )
  return response.data.data
}

export async function getRecommendation(
  id: number
): Promise<RecommendationLetter> {
  const response = await apiClient.get<ApiResponse<RecommendationLetter>>(
    `/v1/admin/recommendations/${id}`
  )
  return response.data.data
}

export async function generateRecommendation(
  userId: number
): Promise<RecommendationLetter> {
  const response = await apiClient.post<ApiResponse<RecommendationLetter>>(
    '/v1/admin/recommendations',
    { user_id: userId }
  )
  return response.data.data
}

export async function updateRecommendationDraft(
  id: number,
  body: string
): Promise<RecommendationLetter> {
  const response = await apiClient.put<ApiResponse<RecommendationLetter>>(
    `/v1/admin/recommendations/${id}`,
    { body }
  )
  return response.data.data
}

export async function regenerateRecommendationDraft(
  id: number
): Promise<RecommendationLetter> {
  const response = await apiClient.post<ApiResponse<RecommendationLetter>>(
    `/v1/admin/recommendations/${id}/regenerate`
  )
  return response.data.data
}

export async function approveRecommendation(
  id: number
): Promise<RecommendationLetter> {
  const response = await apiClient.post<ApiResponse<RecommendationLetter>>(
    `/v1/admin/recommendations/${id}/approve`
  )
  return response.data.data
}

export async function rejectRecommendation(
  id: number,
  notes?: string
): Promise<RecommendationLetter> {
  const response = await apiClient.post<ApiResponse<RecommendationLetter>>(
    `/v1/admin/recommendations/${id}/reject`,
    { notes: notes || null }
  )
  return response.data.data
}
