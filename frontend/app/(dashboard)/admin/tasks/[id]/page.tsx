'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Pencil } from 'lucide-react'
import { getAdminTask } from '@/lib/api/admin/tasks'
import {
  TaskPriorityBadge,
  TaskStatusBadge,
  TaskTypeBadge,
} from '@/components/admin/tasks/badges'
import { DeleteTaskButton } from '@/components/admin/tasks/delete-task-button'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminTaskDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const { data: task, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'tasks', id],
    queryFn: () => getAdminTask(id),
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

  if (isError || !task) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Couldn&apos;t load task.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/admin/tasks" />}
            className="mb-2 gap-1 px-0"
          >
            <ArrowLeft className="size-3.5" />
            Tasks
          </Button>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {task.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <TaskStatusBadge status={task.status} label={task.status_label} />
            <TaskPriorityBadge
              priority={task.priority}
              label={task.priority_label}
            />
            <TaskTypeBadge
              type={task.task_type}
              label={task.task_type_label}
            />
            {task.is_overdue ? (
              <span className="text-xs font-medium text-orange">Overdue</span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!task.is_terminal ? (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/admin/tasks/${id}/edit`} />}
              className="gap-1"
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
          ) : null}
          {!task.is_terminal ? <DeleteTaskButton taskId={task.id} /> : null}
        </div>
      </div>

      <div className="rounded-xl bg-card p-4 ring-1 ring-border/80">
        <h3 className="font-heading text-base font-semibold">Details</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
          {task.description || 'No description provided.'}
        </p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Assigned to</dt>
            <dd className="font-medium">{task.assigned_to?.name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Created by</dt>
            <dd className="font-medium">{task.created_by?.name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Estimated hours</dt>
            <dd className="font-medium">{task.estimated_hours ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Actual hours</dt>
            <dd className="font-medium">{task.actual_hours ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Deadline</dt>
            <dd className="font-medium">{task.deadline ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Completed at</dt>
            <dd className="font-medium">
              {task.completed_at
                ? new Date(task.completed_at).toLocaleString()
                : '—'}
            </dd>
          </div>
          {task.task_type === 'project_task' ? (
            <>
              <div>
                <dt className="text-muted-foreground">Project</dt>
                <dd className="font-medium">
                  {task.milestone?.project?.title ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Milestone</dt>
                <dd className="font-medium">
                  {task.milestone?.title ?? '—'}
                </dd>
              </div>
            </>
          ) : null}
        </dl>
      </div>
    </div>
  )
}
