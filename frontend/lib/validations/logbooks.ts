import { z } from 'zod'

export const logbookStatusValues = [
  'draft',
  'submitted',
  'approved',
  'rejected',
  'revision_needed',
] as const

export const reviewActionValues = [
  'approved',
  'rejected',
  'revision_needed',
] as const

export const logbookFormSchema = z.object({
  task_id: z.number().int().positive('Select a task'),
  date: z.string().min(1, 'Date is required'),
  hours_worked: z
    .number()
    .min(0.5, 'At least 0.5 hours')
    .max(24, 'Max 24 hours'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  blockers: z.string().optional().nullable(),
  learning_outcome: z.string().optional().nullable(),
})

export const logbookUpdateSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  hours_worked: z
    .number()
    .min(0.5, 'At least 0.5 hours')
    .max(24, 'Max 24 hours'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  blockers: z.string().optional().nullable(),
  learning_outcome: z.string().optional().nullable(),
})

export const reviewLogbookSchema = z
  .object({
    action: z.enum(reviewActionValues),
    revision_note: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.action === 'rejected' || data.action === 'revision_needed') &&
      (!data.revision_note || data.revision_note.trim().length < 10)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Feedback must be at least 10 characters',
        path: ['revision_note'],
      })
    }
  })

export const commentSchema = z.object({
  body: z.string().min(2, 'Comment must be at least 2 characters'),
})

export type LogbookFormData = z.infer<typeof logbookFormSchema>
export type LogbookUpdateData = z.infer<typeof logbookUpdateSchema>
export type ReviewLogbookData = z.infer<typeof reviewLogbookSchema>
export type CommentFormData = z.infer<typeof commentSchema>
