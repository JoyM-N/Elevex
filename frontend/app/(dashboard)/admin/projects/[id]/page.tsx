'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getProject } from '@/lib/api/admin/projects'
import { ProjectWorkspace } from '@/components/admin/projects/project-workspace'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const { data: project, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'projects', id],
    queryFn: () => getProject(id),
    enabled: Number.isFinite(id),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Couldn&apos;t load project.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return <ProjectWorkspace project={project} />
}
