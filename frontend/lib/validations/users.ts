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

export const updateInternSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z.string().min(1, 'Email is required').email(),
    phone: z.string().max(30).optional().or(z.literal('')),
    is_active: z.boolean(),
    password: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) =>
          !val || (val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val)),
        'Password must be at least 8 characters with an uppercase letter and a number'
      ),
    password_confirmation: z.string().optional().or(z.literal('')),
    department: z.string().max(255).optional().or(z.literal('')),
    university: z.string().max(255).optional().or(z.literal('')),
    student_id: z.string().max(100).optional().or(z.literal('')),
    start_date: z.string().optional().or(z.literal('')),
    end_date: z.string().optional().or(z.literal('')),
    supervisor_id: z.number().int().positive().optional(),
    notes: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.password !== data.password_confirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['password_confirmation'],
      })
    }

    const editingInternship = Boolean(
      data.department || data.start_date || data.end_date
    )
    if (!editingInternship) return

    if (!data.department) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Department is required',
        path: ['department'],
      })
    }
    if (!data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start date is required',
        path: ['start_date'],
      })
    }
    if (!data.end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date is required',
        path: ['end_date'],
      })
    } else if (data.start_date && data.end_date <= data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
        path: ['end_date'],
      })
    }
  })

export type CreateAdminData = z.infer<typeof createAdminSchema>
export type OnboardInternData = z.infer<typeof onboardInternSchema>
export type UpdateProfileData = z.infer<typeof updateProfileSchema>
export type UpdateInternData = z.infer<typeof updateInternSchema>
