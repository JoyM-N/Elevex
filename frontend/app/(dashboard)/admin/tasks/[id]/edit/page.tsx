'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { getAdminTask, updateTask } from '@/lib/api/admin/tasks'
import { EditTaskForm } from '@/components/admin/tasks/edit-task-form'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { UpdateTaskFormData } from '@/lib/validations/tasks'
import { editableTaskStatusValues } from '@/lib/validations/tasks'

export default function EditTaskPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: task, isLoading, isError } = useQuery({
    queryKey: ['admin', 'tasks', id],
    queryFn: () => getAdminTask(id),
    enabled: Number.isFinite(id),
  })

  const mutation = useMutation({
    mutationFn: (data: UpdateTaskFormData) => updateTask(id, data),
    onSuccess: () => {
      toast.success('Task updated')
      queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] })
      router.push(`/admin/tasks/${id}`)
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to update task'
      toast.error(msg)
    },
  })

  if (isLoading) return <Skeleton className="h-96 w-full max-w-xl rounded-xl" />
  if (isError || !task) {
    return <p className="text-sm text-muted-foreground">Task not found.</p>
  }

  if (task.is_terminal) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          This task is locked and cannot be edited.
        </p>
        <Button render={<Link href={`/admin/tasks/${id}`} />}>
          Back to task
        </Button>
      </div>
    )
  }

  const status = (
    editableTaskStatusValues as readonly string[]
  ).includes(task.status)
    ? (task.status as UpdateTaskFormData['status'])
    : 'todo'

  return (
    <div className="page-enter space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href={`/admin/tasks/${id}`} />}
          className="mb-3 gap-1 px-0"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Edit task
        </h2>
        <p className="mt-1 text-sm font-medium text-foreground">{task.title}</p>
        {task.task_type === 'project_task' ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {task.milestone?.project?.title ?? 'Unknown project'}
            {task.milestone?.title ? ` · ${task.milestone.title}` : ''}
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">General task</p>
        )}
      </div>

      <EditTaskForm
        key={task.id}
        defaultValues={{
          title: task.title,
          description: task.description ?? '',
          priority: task.priority,
          status,
          estimated_hours: task.estimated_hours,
          deadline: task.deadline ?? '',
        }}
        isSubmitting={mutation.isPending}
        onSubmit={(data) => mutation.mutate(data)}
      />
    </div>
  )
}
