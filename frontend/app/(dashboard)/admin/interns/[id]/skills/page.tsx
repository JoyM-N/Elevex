'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, BadgeCheck, Loader2 } from 'lucide-react'
import {
  endorseInternSkill,
  getInternSkills,
} from '@/lib/api/admin/performance'
import { listInterns } from '@/lib/api/admin/projects'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminInternSkillsPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const queryClient = useQueryClient()

  const internsQuery = useQuery({
    queryKey: ['admin', 'interns', { per_page: 100 }],
    queryFn: () => listInterns({ per_page: 100 }),
  })
  const intern = internsQuery.data?.data.find((i) => i.id === id)

  const skillsQuery = useQuery({
    queryKey: ['admin', 'interns', id, 'skills'],
    queryFn: () => getInternSkills(id),
    enabled: Number.isFinite(id),
  })

  const endorse = useMutation({
    mutationFn: (skillId: number) =>
      endorseInternSkill(id, { skill_id: skillId }),
    onSuccess: () => {
      toast.success('Skill endorsed')
      queryClient.invalidateQueries({
        queryKey: ['admin', 'interns', id, 'skills'],
      })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Endorse failed'
      toast.error(msg)
    },
  })

  if (skillsQuery.isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />
  }

  return (
    <div className="page-enter space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/admin/interns/${id}/performance`} />}
          className="mb-2 gap-1 px-0"
        >
          <ArrowLeft className="size-3.5" />
          Performance
        </Button>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {intern?.name ?? 'Intern'} skills
        </h2>
        <p className="text-sm text-muted-foreground">
          Endorse proficiency claimed by the intern
        </p>
      </div>

      {(skillsQuery.data ?? []).length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border/80">
          <p className="font-medium">No skills assigned yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The intern can add skills from their profile.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {(skillsQuery.data ?? []).map((skill) => (
            <li
              key={skill.id}
              className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-border/80 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{skill.name}</p>
                <p className="text-xs capitalize text-muted-foreground">
                  {skill.category} · {skill.proficiency_level ?? '—'}
                  {skill.endorsed_at
                    ? ` · Endorsed ${new Date(skill.endorsed_at).toLocaleDateString()}`
                    : ''}
                </p>
              </div>
              <Button
                size="sm"
                variant={skill.endorsed_at ? 'outline' : 'default'}
                className="gap-1"
                disabled={!!skill.endorsed_at || endorse.isPending}
                onClick={() => endorse.mutate(skill.id)}
              >
                {endorse.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <BadgeCheck className="size-3.5" />
                )}
                {skill.endorsed_at ? 'Endorsed' : 'Endorse'}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
