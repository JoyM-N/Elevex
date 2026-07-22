'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { getProject, updateProject } from '@/lib/api/admin/projects'
import { ProjectForm } from '@/components/admin/projects/project-form'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProjectFormData } from '@/lib/validations/projects'

export default function EditProjectPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['admin', 'projects', id],
    queryFn: () => getProject(id),
    enabled: Number.isFinite(id),
  })

  const mutation = useMutation({
    mutationFn: (data: ProjectFormData) => updateProject(id, data),
    onSuccess: () => {
      toast.success('Project updated')
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] })
      router.push(`/admin/projects/${id}`)
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to update project'
      toast.error(msg)
    },
  })

  if (isLoading) return <Skeleton className="h-96 w-full max-w-xl rounded-xl" />
  if (isError || !project) {
    return <p className="text-sm text-muted-foreground">Project not found.</p>
  }

  if (project.is_locked) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          This project is locked and cannot be edited.
        </p>
        <Button render={<Link href={`/admin/projects/${id}`} />}>
          Back to project
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
          render={<Link href={`/admin/projects/${id}`} />}
          className="mb-3 gap-1 px-0"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Edit project
        </h2>
      </div>

      <ProjectForm
        key={project.id}
        defaultValues={{
          title: project.title,
          description: project.description ?? '',
          status: project.status,
          priority: project.priority,
          start_date: project.start_date,
          end_date: project.end_date,
        }}
        submitLabel="Save changes"
        isSubmitting={mutation.isPending}
        onSubmit={(data) => mutation.mutate(data)}
      />
    </div>
  )
}
