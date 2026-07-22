'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { listInternTasks } from '@/lib/api/intern/tasks'
import {
  TaskPriorityBadge,
  TaskStatusBadge,
} from '@/components/admin/tasks/badges'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function InternTasksPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['intern', 'tasks', page],
    queryFn: () => listInternTasks({ page, per_page: 50 }),
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const rows = data?.data ?? []
    if (!q) return rows
    return rows.filter((task) => {
      const haystack = [
        task.title,
        task.milestone?.project?.title,
        task.milestone?.title,
        task.status,
        task.priority,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [data?.data, search])

  return (
    <div className="page-enter space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          My tasks
        </h2>
        <p className="text-sm text-muted-foreground">
          Work assigned to you by your admin
        </p>
      </div>

      <Input
        placeholder="Search tasks…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
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
      ) : (data?.data ?? []).length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border/80">
          <p className="font-heading text-lg font-semibold">No tasks yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tasks appear here once an admin assigns them to you.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border/80">
          <p className="font-heading text-lg font-semibold">No matches</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try another search term.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((task) => (
                  <TableRow key={task.id} className="hover:bg-muted/40">
                    <TableCell>
                      <Link
                        href={`/intern/tasks/${task.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {task.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {task.milestone?.project?.title ?? 'General'}
                    </TableCell>
                    <TableCell>
                      <TaskStatusBadge
                        status={task.status}
                        label={task.status_label}
                      />
                    </TableCell>
                    <TableCell>
                      <TaskPriorityBadge
                        priority={task.priority}
                        label={task.priority_label}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {task.deadline ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data?.meta && data.meta.last_page > 1 && !search.trim() ? (
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
