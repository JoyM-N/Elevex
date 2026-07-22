import { z } from 'zod'

export const evaluationScoreSchema = z.number().int().min(1).max(5)

export const createEvaluationSchema = z.object({
  user_id: z.number().int().positive('Select an intern'),
  internship_id: z.number().int().positive('Intern must have an active internship'),
  communication_score: evaluationScoreSchema,
  professionalism_score: evaluationScoreSchema,
  initiative_score: evaluationScoreSchema,
  problem_solving_score: evaluationScoreSchema,
  teamwork_score: evaluationScoreSchema,
  remarks: z.string().optional().nullable(),
})

export const updateEvaluationSchema = z.object({
  communication_score: evaluationScoreSchema,
  professionalism_score: evaluationScoreSchema,
  initiative_score: evaluationScoreSchema,
  problem_solving_score: evaluationScoreSchema,
  teamwork_score: evaluationScoreSchema,
  remarks: z.string().optional().nullable(),
})

export const assignSkillSchema = z.object({
  skill_id: z.number().int().positive('Select a skill'),
  proficiency_level: z.enum([
    'beginner',
    'intermediate',
    'advanced',
    'expert',
  ]),
})

export const endorseSkillSchema = z.object({
  skill_id: z.number().int().positive(),
})

export type CreateEvaluationData = z.infer<typeof createEvaluationSchema>
export type UpdateEvaluationData = z.infer<typeof updateEvaluationSchema>
export type AssignSkillData = z.infer<typeof assignSkillSchema>
export type EndorseSkillData = z.infer<typeof endorseSkillSchema>
