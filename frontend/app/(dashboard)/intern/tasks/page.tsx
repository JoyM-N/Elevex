'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listInternTasks } from '@/lib/api/intern/tasks'
import {
  TaskFilters,
  type TaskFiltersState,
} from '@/components/admin/tasks/task-filters'
import { TaskList, TaskTypeTabs } from '@/components/admin/tasks/task-list'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function InternTasksPage() {
  const [page, setPage] = useState(1)
  const [view, setView] = useState<'project' | 'general'>('project')
  const [filters, setFilters] = useState<TaskFiltersState>({
    search: '',
    status: '',
    priority: '',
    task_type: '',
  })

  const taskType = view === 'project' ? 'project_task' : 'general_task'

  const queryKey = useMemo(
    () => ['intern', 'tasks', { ...filters, taskType, page }],
    [filters, taskType, page]
  )

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      listInternTasks({
        page,
        per_page: 15,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        task_type: taskType,
      }),
  })

  return (
    <div className="page-enter space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          My tasks
        </h2>
        <p className="text-sm text-muted-foreground">Work assigned to you</p>
      </div>

      <TaskTypeTabs
        value={view}
        onChange={(next) => {
          setView(next)
          setPage(1)
        }}
        projectCount={view === 'project' ? data?.meta?.total : undefined}
        generalCount={view === 'general' ? data?.meta?.total : undefined}
      />

      <TaskFilters
        value={filters}
        showSearch={false}
        onChange={(next) => {
          setPage(1)
          setFilters(next)
        }}
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : isError ? (
        <div className="rounded-xl bg-card p-8 text-center ring-1 ring-border/80">
          <p className="font-medium">Couldn&apos;t load tasks</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <TaskList
            tasks={data?.data ?? []}
            hrefBase="/intern/tasks"
            showAssignee={false}
            mode={view}
          />
          {data?.meta && data.meta.last_page > 1 ? (
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Page {data.meta.current_page} of {data.meta.last_page}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
