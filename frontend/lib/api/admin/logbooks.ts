import apiClient from '@/lib/api/axios'
import type {
  ApiResponse,
  Comment,
  InternLogbookSummary,
  Logbook,
  LogbookSignoff,
  LogbookStatus,
  PaginatedResponse,
} from '@/types'
import type {
  CommentFormData,
  ReviewLogbookData,
} from '@/lib/validations/logbooks'

export type AdminLogbookListParams = {
  status?: LogbookStatus | ''
  user_id?: number
  task_id?: number
  date?: string
  page?: number
  per_page?: number
}

export async function listLogbookInterns(params: {
  page?: number
  per_page?: number
} = {}): Promise<PaginatedResponse<InternLogbookSummary>> {
  const response = await apiClient.get<PaginatedResponse<InternLogbookSummary>>(
    '/v1/admin/logbooks/interns',
    { params }
  )
  return response.data
}

export async function listAdminLogbooks(
  params: AdminLogbookListParams = {}
): Promise<PaginatedResponse<Logbook>> {
  const response = await apiClient.get<PaginatedResponse<Logbook>>(
    '/v1/admin/logbooks',
    {
      params: Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
      ),
    }
  )
  return response.data
}

export async function getAdminLogbook(id: number): Promise<Logbook> {
  const response = await apiClient.get<ApiResponse<Logbook>>(
    `/v1/admin/logbooks/${id}`
  )
  return response.data.data
}

export async function reviewLogbook(
  id: number,
  data: ReviewLogbookData
): Promise<Logbook> {
  const response = await apiClient.patch<ApiResponse<Logbook>>(
    `/v1/admin/logbooks/${id}/review`,
    {
      action: data.action,
      revision_note: data.revision_note || null,
    }
  )
  return response.data.data
}

export async function finalizeInternLogbook(
  userId: number,
  note?: string | null
): Promise<LogbookSignoff> {
  const response = await apiClient.post<ApiResponse<LogbookSignoff>>(
    `/v1/admin/logbooks/interns/${userId}/finalize`,
    { note: note || null }
  )
  return response.data.data
}

export async function addAdminLogbookComment(
  id: number,
  data: CommentFormData
): Promise<Comment> {
  const response = await apiClient.post<ApiResponse<Comment>>(
    `/v1/admin/logbooks/${id}/comments`,
    data
  )
  return response.data.data
}
