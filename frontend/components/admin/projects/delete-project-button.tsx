'use client'

import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
import { deleteProject } from '@/lib/api/admin/projects'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function DeleteProjectButton({
  projectId,
  disabled,
}: {
  projectId: number
  disabled?: boolean
}) {
  const { isSuperAdmin } = useAuth()
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: () => deleteProject(projectId),
    onSuccess: () => {
      toast.success('Project deleted')
      router.push('/admin/projects')
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to delete project'
      toast.error(msg)
    },
  })

  if (!isSuperAdmin) return null

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="destructive"
            size="sm"
            disabled={disabled || mutation.isPending}
            className="gap-1"
          />
        }
      >
        {mutation.isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Trash2 className="size-3.5" />
        )}
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone. Related milestones may also be affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()}>
            Delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
