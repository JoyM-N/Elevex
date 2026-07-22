'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { createLogbook } from '@/lib/api/intern/logbooks'
import { CreateLogbookForm } from '@/components/intern/logbooks/logbook-form'
import { Button } from '@/components/ui/button'
import type { LogbookFormData } from '@/lib/validations/logbooks'

export default function NewLogbookPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: LogbookFormData) => createLogbook(data),
    onSuccess: (logbook) => {
      toast.success('Logbook created')
      queryClient.invalidateQueries({ queryKey: ['intern', 'logbooks'] })
      router.push(`/intern/logbooks/${logbook.id}`)
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to create logbook'
      toast.error(msg)
    },
  })

  return (
    <div className="page-enter space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/intern/logbooks" />}
          className="mb-3 gap-1 px-0"
        >
          <ArrowLeft className="size-3.5" />
          Back to logbooks
        </Button>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          New logbook entry
        </h2>
        <p className="text-sm text-muted-foreground">
          Log work against one of your assigned tasks. You can upload files and
          submit after saving.
        </p>
      </div>

      <CreateLogbookForm
        isSubmitting={mutation.isPending}
        onSubmit={(data) => mutation.mutate(data)}
      />
    </div>
  )
}
