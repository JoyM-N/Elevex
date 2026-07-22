'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listInternProjects } from '@/lib/api/intern/projects'
import { PriorityBadge, StatusBadge } from '@/components/admin/projects/badges'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function humanize(role?: string | null) {
  if (!role) return '—'
  return role.split('_').map((p) => p[0].toUpperCase() + p.slice(1)).join(' ')
}

export default function InternProjectsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['intern', 'projects', page],
    queryFn: () => listInternProjects({ page, per_page: 15 }),
  })

  return (
    <div className="page-enter space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          My projects
        </h2>
        <p className="text-sm text-muted-foreground">
          Projects you are assigned to
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : isError ? (
        <div className="rounded-xl bg-card p-8 text-center ring-1 ring-border/80">
          <p className="font-medium">Couldn&apos;t load projects</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (data?.data?.length ?? 0) === 0 ? (
        <div className="rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border/80">
          <p className="font-heading text-lg font-semibold">No projects yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You haven&apos;t been assigned to any projects.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Your role</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>End date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.data ?? []).map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Link
                        href={`/intern/projects/${project.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {project.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={project.status}
                        label={project.status_label}
                      />
                    </TableCell>
                    <TableCell className="text-sm capitalize text-muted-foreground">
                      {humanize(project.my_team_role)}
                    </TableCell>
                    <TableCell>
                      <PriorityBadge
                        priority={project.priority}
                        label={project.priority_label}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {project.end_date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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
