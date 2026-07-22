'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { deleteTask } from '@/lib/api/admin/tasks'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'

export function DeleteTaskButton({ taskId }: { taskId: number }) {
  const { user } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteTask(taskId),
    onSuccess: () => {
      toast.success('Task deleted')
      queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] })
      router.push('/admin/tasks')
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to delete task'
      toast.error(msg)
    },
  })

  if (user?.role !== 'super_admin') return null

  return (
    <Button
      variant="destructive"
      size="sm"
      className="gap-1"
      disabled={mutation.isPending}
      onClick={() => {
        if (confirm('Delete this task?')) mutation.mutate()
      }}
    >
      <Trash2 className="size-3.5" />
      Delete
    </Button>
  )
}
