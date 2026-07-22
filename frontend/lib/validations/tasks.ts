import { z } from 'zod'

export const taskStatusValues = [
  'todo',
  'in_progress',
  'in_review',
  'completed',
  'blocked',
  'cancelled',
] as const

export const taskTypeValues = ['project_task', 'general_task'] as const

export const taskPriorityValues = [
  'low',
  'medium',
  'high',
  'critical',
] as const

/** Statuses an admin can set via update (not completion flow) */
export const editableTaskStatusValues = [
  'todo',
  'in_progress',
  'in_review',
  'blocked',
  'cancelled',
] as const

export const createTaskSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().optional().nullable(),
    task_type: z.enum(taskTypeValues),
    priority: z.enum(taskPriorityValues),
    assigned_to: z.number().int().positive('Select an intern'),
    estimated_hours: z.number().min(0.5).max(999).optional().nullable(),
    deadline: z.string().optional().nullable(),
    milestone_id: z.number().int().positive().optional().nullable(),
    project_id: z.number().int().positive().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.task_type === 'project_task' && !data.milestone_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a milestone for project tasks',
        path: ['milestone_id'],
      })
    }
  })

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional().nullable(),
  priority: z.enum(taskPriorityValues),
  status: z.enum(editableTaskStatusValues),
  estimated_hours: z.number().min(0.5).max(999).optional().nullable(),
  deadline: z.string().optional().nullable(),
})

export const completeTaskSchema = z.object({
  actual_hours: z
    .number()
    .min(0.5, 'Enter at least 0.5 hours')
    .max(999),
  notes: z.string().optional().nullable(),
})

export type CreateTaskFormData = z.infer<typeof createTaskSchema>
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>
export type CompleteTaskFormData = z.infer<typeof completeTaskSchema>
