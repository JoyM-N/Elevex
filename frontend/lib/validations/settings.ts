import { z } from 'zod'

export const createHolidaySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  name: z.string().min(1, 'Name is required').max(255),
  country: z
    .string()
    .length(2, 'Use a 2-letter country code')
    .optional()
    .or(z.literal('')),
})

export const requestSickDaySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  reason: z.string().max(500).optional().or(z.literal('')),
})

export const reviewSickDaySchema = z.object({
  action: z.enum(['approved', 'rejected']),
  notes: z.string().max(500).optional().or(z.literal('')),
})

export type CreateHolidayData = z.infer<typeof createHolidaySchema>
export type RequestSickDayData = z.infer<typeof requestSickDaySchema>
export type ReviewSickDayData = z.infer<typeof reviewSickDaySchema>
