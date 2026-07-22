import apiClient from '@/lib/api/axios'
import type { ApiResponse, PaginatedResponse, User } from '@/types'
import type {
  CreateAdminData,
  OnboardInternData,
  UpdateInternData,
} from '@/lib/validations/users'

export async function listAdmins(params: {
  search?: string
  is_active?: boolean
  per_page?: number
  page?: number
} = {}): Promise<PaginatedResponse<User>> {
  const response = await apiClient.get<PaginatedResponse<User>>(
    '/v1/super-admin/admins',
    {
      params: Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
      ),
    }
  )
  return response.data
}

export async function createAdmin(data: CreateAdminData): Promise<User> {
  const response = await apiClient.post<ApiResponse<User>>(
    '/v1/super-admin/admins',
    {
      ...data,
      phone: data.phone || null,
    }
  )
  return response.data.data
}

export async function getIntern(id: number): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>(
    `/v1/admin/interns/${id}`
  )
  return response.data.data
}

export async function onboardIntern(data: OnboardInternData): Promise<User> {
  const payload = {
    ...data,
    phone: data.phone || null,
    university: data.university || null,
    student_id: data.student_id || null,
    notes: data.notes || null,
    supervisor_id: data.supervisor_id || undefined,
  }
  const response = await apiClient.post<ApiResponse<User>>(
    '/v1/admin/interns',
    payload
  )
  return response.data.data
}

export async function updateIntern(
  id: number,
  data: UpdateInternData
): Promise<User> {
  const payload: Record<string, unknown> = {
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    is_active: data.is_active,
  }

  if (data.department) {
    payload.department = data.department
    payload.university = data.university || null
    payload.student_id = data.student_id || null
    payload.start_date = data.start_date
    payload.end_date = data.end_date
    payload.notes = data.notes || null
    if (data.supervisor_id) {
      payload.supervisor_id = data.supervisor_id
    }
  }

  if (data.password) {
    payload.password = data.password
    payload.password_confirmation = data.password_confirmation
  }

  const response = await apiClient.put<ApiResponse<User>>(
    `/v1/admin/interns/${id}`,
    payload
  )
  return response.data.data
}
