import { z } from 'zod'

const passwordRules = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const createAdminSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z.string().min(1, 'Email is required').email(),
    password: passwordRules,
    password_confirmation: z.string(),
    phone: z.string().max(30).optional().or(z.literal('')),
    is_active: z.boolean().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

export const onboardInternSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z.string().min(1, 'Email is required').email(),
    password: passwordRules,
    password_confirmation: z.string(),
    phone: z.string().max(30).optional().or(z.literal('')),
    department: z.string().min(1, 'Department is required').max(255),
    university: z.string().max(255).optional().or(z.literal('')),
    student_id: z.string().max(100).optional().or(z.literal('')),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    supervisor_id: z.number().int().positive().optional(),
    notes: z.string().optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })
  .refine((data) => data.end_date > data.start_date, {
    message: 'End date must be after start date',
    path: ['end_date'],
  })

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  phone: z.string().max(30).optional().or(z.literal('')),
})

export type CreateAdminData = z.infer<typeof createAdminSchema>
export type OnboardInternData = z.infer<typeof onboardInternSchema>
export type UpdateProfileData = z.infer<typeof updateProfileSchema>
