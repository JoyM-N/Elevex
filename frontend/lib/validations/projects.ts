import { z } from 'zod'

export const projectStatusValues = [
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
] as const

export const projectPriorityValues = [
  'low',
  'medium',
  'high',
  'critical',
] as const

export const milestoneStatusValues = [
  'pending',
  'in_progress',
  'completed',
] as const

export const teamRoleValues = [
  'frontend',
  'backend',
  'full_stack',
  'devops',
  'design',
  'qa',
  'documentation',
  'solo',
] as const

export const projectFormSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().optional().nullable(),
    status: z.enum(projectStatusValues),
    priority: z.enum(projectPriorityValues),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: 'End date must be after start date',
    path: ['end_date'],
  })

export const milestoneFormSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().optional().nullable(),
    status: z.enum(milestoneStatusValues).optional(),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: 'End date must be after start date',
    path: ['end_date'],
  })

export const assignMembersSchema = z.object({
  members: z
    .array(
      z.object({
        user_id: z.number().int().positive(),
        team_role: z.enum(teamRoleValues),
      })
    )
    .min(1, 'Select at least one member'),
})

export type ProjectFormData = z.infer<typeof projectFormSchema>
export type MilestoneFormData = z.infer<typeof milestoneFormSchema>
export type AssignMembersFormData = z.infer<typeof assignMembersSchema>
