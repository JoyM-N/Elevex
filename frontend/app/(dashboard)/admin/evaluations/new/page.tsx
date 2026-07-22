'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createEvaluation } from '@/lib/api/admin/performance'
import { listInterns } from '@/lib/api/admin/projects'
import {
  createEvaluationSchema,
  type CreateEvaluationData,
} from '@/lib/validations/performance'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const SCORE_FIELDS = [
  { name: 'communication_score', label: 'Communication' },
  { name: 'professionalism_score', label: 'Professionalism' },
  { name: 'initiative_score', label: 'Initiative' },
  { name: 'problem_solving_score', label: 'Problem solving' },
  { name: 'teamwork_score', label: 'Teamwork' },
] as const

export default function NewEvaluationPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: internsData } = useQuery({
    queryKey: ['admin', 'interns', { per_page: 100 }],
    queryFn: () => listInterns({ per_page: 100 }),
  })

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateEvaluationData>({
    resolver: zodResolver(createEvaluationSchema),
    defaultValues: {
      communication_score: 3,
      professionalism_score: 3,
      initiative_score: 3,
      problem_solving_score: 3,
      teamwork_score: 3,
      remarks: '',
    },
  })

  const userId = useWatch({ control, name: 'user_id' })
  const selected = internsData?.data.find((i) => i.id === userId)

  useEffect(() => {
    const internshipId = selected?.active_internship?.id
    if (internshipId) {
      setValue('internship_id', internshipId)
    }
  }, [selected, setValue])

  const mutation = useMutation({
    mutationFn: createEvaluation,
    onSuccess: (evaluation) => {
      toast.success('Evaluation submitted')
      queryClient.invalidateQueries({ queryKey: ['admin', 'evaluations'] })
      if (evaluation.user?.id) {
        queryClient.invalidateQueries({
          queryKey: ['admin', 'interns', evaluation.user.id, 'performance'],
        })
      }
      router.push(`/admin/evaluations/${evaluation.id}`)
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to create evaluation'
      toast.error(msg)
    },
  })

  return (
    <div className="page-enter space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/admin/evaluations" />}
          className="mb-3 gap-1 px-0"
        >
          <ArrowLeft className="size-3.5" />
          Evaluations
        </Button>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          New evaluation
        </h2>
        <p className="text-sm text-muted-foreground">
          Score each dimension from 1–5
        </p>
      </div>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="max-w-xl space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="user_id">Intern</Label>
          <select
            id="user_id"
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            {...register('user_id', { valueAsNumber: true })}
          >
            <option value="">Select intern…</option>
            {(internsData?.data ?? []).map((intern) => (
              <option key={intern.id} value={intern.id}>
                {intern.name}
                {!intern.active_internship ? ' (no active internship)' : ''}
              </option>
            ))}
          </select>
          {errors.user_id && (
            <p className="text-sm text-destructive">{errors.user_id.message}</p>
          )}
          {selected && !selected.active_internship ? (
            <p className="text-sm text-destructive">
              This intern has no active internship on record.
            </p>
          ) : null}
          {errors.internship_id && (
            <p className="text-sm text-destructive">
              {errors.internship_id.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {SCORE_FIELDS.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              <select
                id={field.name}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                {...register(field.name, { valueAsNumber: true })}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks (optional)</Label>
          <Textarea id="remarks" rows={4} {...register('remarks')} />
        </div>

        <Button
          type="submit"
          disabled={mutation.isPending || !selected?.active_internship}
          className="gap-2"
        >
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Submit evaluation
        </Button>
      </form>
    </div>
  )
}
