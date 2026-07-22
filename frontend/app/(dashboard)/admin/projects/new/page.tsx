'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { createProject } from '@/lib/api/admin/projects'
import { ProjectForm } from '@/components/admin/projects/project-form'
import { Button } from '@/components/ui/button'
import type { ProjectFormData } from '@/lib/validations/projects'

export default function NewProjectPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      toast.success('Project created')
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] })
      router.push(`/admin/projects/${project.id}`)
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to create project'
      toast.error(msg)
    },
  })

  return (
    <div className="page-enter space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/admin/projects" />}
          className="mb-3 gap-1 px-0"
        >
          <ArrowLeft className="size-3.5" />
          Back to projects
        </Button>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          New project
        </h2>
        <p className="text-sm text-muted-foreground">
          Create a project and assign members from the detail page.
        </p>
      </div>

      <ProjectForm
        submitLabel="Create project"
        isSubmitting={mutation.isPending}
        onSubmit={(data: ProjectFormData) => mutation.mutate(data)}
      />
    </div>
  )
}
