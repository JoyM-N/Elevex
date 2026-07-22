import apiClient from '@/lib/api/axios'
import type { ApiResponse, RecommendationLetter, RecommendationStatus } from '@/types'

export async function listMyRecommendations(params: {
  status?: RecommendationStatus
} = {}): Promise<RecommendationLetter[]> {
  const response = await apiClient.get<ApiResponse<RecommendationLetter[]>>(
    '/v1/intern/recommendations',
    { params }
  )
  return response.data.data
}

export async function requestRecommendation(
  internshipId: number
): Promise<RecommendationLetter> {
  const response = await apiClient.post<ApiResponse<RecommendationLetter>>(
    '/v1/intern/recommendations',
    { internship_id: internshipId }
  )
  return response.data.data
}

export async function getMyRecommendation(
  id: number
): Promise<RecommendationLetter> {
  const response = await apiClient.get<ApiResponse<RecommendationLetter>>(
    `/v1/intern/recommendations/${id}`
  )
  return response.data.data
}
