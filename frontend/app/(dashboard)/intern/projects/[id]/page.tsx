'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { getInternProject } from '@/lib/api/intern/projects'
import { PriorityBadge, StatusBadge } from '@/components/admin/projects/badges'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

function humanize(role?: string | null) {
  if (!role) return '—'
  return role.split('_').map((p) => p[0].toUpperCase() + p.slice(1)).join(' ')
}

export default function InternProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const { data: project, isLoading, isError, refetch } = useQuery({
    queryKey: ['intern', 'projects', id],
    queryFn: () => getInternProject(id),
    enabled: Number.isFinite(id),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Couldn&apos;t load this project.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/intern/projects" />}
          className="mb-2 gap-1 px-0"
        >
          <ArrowLeft className="size-3.5" />
          My projects
        </Button>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {project.title}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={project.status} label={project.status_label} />
          <PriorityBadge
            priority={project.priority}
            label={project.priority_label}
          />
          <span className="text-xs text-muted-foreground">
            Your role: {humanize(project.my_team_role)}
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-card p-4 ring-1 ring-border/80">
        <h3 className="font-heading text-base font-semibold">Overview</h3>
        <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
          {project.description || 'No description provided.'}
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Start</dt>
            <dd className="font-medium">{project.start_date}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">End</dt>
            <dd className="font-medium">{project.end_date}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl bg-card p-4 ring-1 ring-border/80">
        <h3 className="font-heading text-base font-semibold">Milestones</h3>
        {(project.milestones ?? []).length === 0 ? (
          <p className="mt-4 py-6 text-center text-sm text-muted-foreground">
            No milestones yet
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border/70">
            {(project.milestones ?? []).map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">{m.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.start_date} → {m.end_date}
                  </p>
                </div>
                <StatusBadge status={m.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
