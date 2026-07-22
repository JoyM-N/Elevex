'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { listProjects } from '@/lib/api/admin/projects'
import {
  ProjectFilters,
  type ProjectFiltersState,
} from '@/components/admin/projects/project-filters'
import { ProjectTable } from '@/components/admin/projects/project-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminProjectsPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ProjectFiltersState>({
    search: '',
    status: '',
    priority: '',
  })

  // Debounce-ish: search updates immediately; fine for admin scale
  const queryKey = useMemo(
    () => ['admin', 'projects', { ...filters, page }],
    [filters, page]
  )

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      listProjects({
        page,
        per_page: 15,
        search: filters.search || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
      }),
  })

  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Projects
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage internship projects and teams
          </p>
        </div>
        <Button render={<Link href="/admin/projects/new" />} className="gap-1">
          <Plus className="size-4" />
          New project
        </Button>
      </div>

      <ProjectFilters
        value={filters}
        onChange={(next) => {
          setPage(1)
          setFilters(next)
        }}
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : isError ? (
        <div className="rounded-xl bg-card p-8 text-center ring-1 ring-border/80">
          <p className="font-medium">Couldn&apos;t load projects</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <ProjectTable projects={data?.data ?? []} />
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
