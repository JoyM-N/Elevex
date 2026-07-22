'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react'
import {
  assignMySkill,
  getMySkills,
  listAvailableSkills,
  removeMySkill,
} from '@/lib/api/intern/performance'
import {
  assignSkillSchema,
  type AssignSkillData,
} from '@/lib/validations/performance'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

export default function InternSkillsPage() {
  const queryClient = useQueryClient()

  const mineQuery = useQuery({
    queryKey: ['intern', 'skills', 'mine'],
    queryFn: getMySkills,
  })
  const catalogQuery = useQuery({
    queryKey: ['intern', 'skills', 'catalog'],
    queryFn: listAvailableSkills,
  })

  const mineIds = useMemo(
    () => new Set((mineQuery.data ?? []).map((s) => s.id)),
    [mineQuery.data]
  )

  const available = useMemo(
    () => (catalogQuery.data ?? []).filter((s) => !mineIds.has(s.id)),
    [catalogQuery.data, mineIds]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignSkillData>({
    resolver: zodResolver(assignSkillSchema),
    defaultValues: { proficiency_level: 'beginner' },
  })

  const assign = useMutation({
    mutationFn: assignMySkill,
    onSuccess: () => {
      toast.success('Skill added')
      reset({ skill_id: undefined, proficiency_level: 'beginner' })
      queryClient.invalidateQueries({ queryKey: ['intern', 'skills'] })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to add skill'
      toast.error(msg)
    },
  })

  const remove = useMutation({
    mutationFn: removeMySkill,
    onSuccess: () => {
      toast.success('Skill removed')
      queryClient.invalidateQueries({ queryKey: ['intern', 'skills'] })
    },
    onError: () => toast.error('Failed to remove skill'),
  })

  if (mineQuery.isLoading || catalogQuery.isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />
  }

  return (
    <div className="page-enter space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/intern/performance" />}
          className="mb-2 gap-1 px-0"
        >
          <ArrowLeft className="size-3.5" />
          Performance
        </Button>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          My skills
        </h2>
        <p className="text-sm text-muted-foreground">
          Add skills and proficiency — admins can endorse them
        </p>
      </div>

      <form
        onSubmit={handleSubmit((data) => assign.mutate(data))}
        className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-border/80 sm:flex-row sm:items-end"
      >
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="skill_id">Skill</Label>
          <select
            id="skill_id"
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            {...register('skill_id', { valueAsNumber: true })}
          >
            <option value="">Select skill…</option>
            {available.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name} ({skill.category})
              </option>
            ))}
          </select>
          {errors.skill_id && (
            <p className="text-sm text-destructive">{errors.skill_id.message}</p>
          )}
        </div>
        <div className="space-y-2 sm:w-44">
          <Label htmlFor="proficiency_level">Level</Label>
          <select
            id="proficiency_level"
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            {...register('proficiency_level')}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        <Button type="submit" disabled={assign.isPending} className="gap-1">
          {assign.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Plus className="size-3.5" />
          )}
          Add
        </Button>
      </form>

      {(mineQuery.data ?? []).length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-12 text-center ring-1 ring-border/80">
          <p className="text-sm text-muted-foreground">No skills added yet</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {(mineQuery.data ?? []).map((skill) => (
            <li
              key={skill.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-card p-4 ring-1 ring-border/80"
            >
              <div>
                <p className="font-medium">{skill.name}</p>
                <p className="text-xs capitalize text-muted-foreground">
                  {skill.category} · {skill.proficiency_level}
                  {skill.endorsed_at ? ' · Endorsed' : ''}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={remove.isPending}
                onClick={() => {
                  if (confirm(`Remove ${skill.name}?`)) {
                    remove.mutate(skill.id)
                  }
                }}
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
