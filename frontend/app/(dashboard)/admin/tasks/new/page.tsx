'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { createTask } from '@/lib/api/admin/tasks'
import { CreateTaskForm } from '@/components/admin/tasks/create-task-form'
import { Button } from '@/components/ui/button'
import type { CreateTaskFormData } from '@/lib/validations/tasks'

export default function NewTaskPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: (task) => {
      toast.success('Task created')
      queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] })
      router.push(`/admin/tasks/${task.id}`)
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to create task'
      toast.error(msg)
    },
  })

  return (
    <div className="page-enter space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/admin/tasks" />}
          className="mb-3 gap-1 px-0"
        >
          <ArrowLeft className="size-3.5" />
          Back to tasks
        </Button>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          New task
        </h2>
        <p className="text-sm text-muted-foreground">
          Create a project or general task and assign it to an intern.
        </p>
      </div>

      <CreateTaskForm
        isSubmitting={mutation.isPending}
        onSubmit={(data: CreateTaskFormData) => mutation.mutate(data)}
      />
    </div>
  )
}
