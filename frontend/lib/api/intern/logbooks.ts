import apiClient from '@/lib/api/axios'
import type {
  ApiResponse,
  Comment,
  FileUpload,
  Logbook,
  LogbookStatus,
  PaginatedResponse,
} from '@/types'
import type {
  CommentFormData,
  LogbookFormData,
  LogbookUpdateData,
} from '@/lib/validations/logbooks'

export type InternLogbookListParams = {
  status?: LogbookStatus | ''
  task_id?: number
  date?: string
  page?: number
  per_page?: number
}

function cleanParams(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
  )
}

export async function listInternLogbooks(
  params: InternLogbookListParams = {}
): Promise<PaginatedResponse<Logbook>> {
  const response = await apiClient.get<PaginatedResponse<Logbook>>(
    '/v1/intern/logbooks',
    { params: cleanParams(params) }
  )
  return response.data
}

export async function getInternLogbook(id: number): Promise<Logbook> {
  const response = await apiClient.get<ApiResponse<Logbook>>(
    `/v1/intern/logbooks/${id}`
  )
  return response.data.data
}

export async function createLogbook(data: LogbookFormData): Promise<Logbook> {
  const response = await apiClient.post<ApiResponse<Logbook>>(
    '/v1/intern/logbooks',
    {
      ...data,
      blockers: data.blockers || null,
      learning_outcome: data.learning_outcome || null,
    }
  )
  return response.data.data
}

export async function updateLogbook(
  id: number,
  data: LogbookUpdateData
): Promise<Logbook> {
  const response = await apiClient.put<ApiResponse<Logbook>>(
    `/v1/intern/logbooks/${id}`,
    {
      ...data,
      blockers: data.blockers || null,
      learning_outcome: data.learning_outcome || null,
    }
  )
  return response.data.data
}

export async function submitLogbook(id: number): Promise<Logbook> {
  const response = await apiClient.patch<ApiResponse<Logbook>>(
    `/v1/intern/logbooks/${id}/submit`
  )
  return response.data.data
}

export async function deleteLogbook(id: number): Promise<void> {
  await apiClient.delete(`/v1/intern/logbooks/${id}`)
}

export async function uploadLogbookFile(
  id: number,
  file: File
): Promise<FileUpload> {
  const form = new FormData()
  form.append('file', file)
  const response = await apiClient.post<ApiResponse<FileUpload>>(
    `/v1/intern/logbooks/${id}/files`,
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  )
  return response.data.data
}

export async function addInternLogbookComment(
  id: number,
  data: CommentFormData
): Promise<Comment> {
  const response = await apiClient.post<ApiResponse<Comment>>(
    `/v1/intern/logbooks/${id}/comments`,
    data
  )
  return response.data.data
}
