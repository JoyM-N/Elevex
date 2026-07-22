'use client'

import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FileText, Loader2, Paperclip, Upload } from 'lucide-react'
import { uploadLogbookFile } from '@/lib/api/intern/logbooks'
import type { FileUpload } from '@/types'
import { Button } from '@/components/ui/button'

export function LogbookFiles({
  logbookId,
  files,
  canUpload,
  queryKey,
}: {
  logbookId: number
  files: FileUpload[]
  canUpload?: boolean
  queryKey: unknown[]
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const [dragging, setDragging] = useState(false)

  const mutation = useMutation({
    mutationFn: (file: File) => uploadLogbookFile(logbookId, file),
    onSuccess: () => {
      toast.success('File uploaded')
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to upload file'
      toast.error(msg)
    },
  })

  function handleFiles(list: FileList | null) {
    const file = list?.[0]
    if (!file) return
    mutation.mutate(file)
  }

  return (
    <div className="space-y-3 rounded-xl bg-card p-4 ring-1 ring-border/80">
      <div>
        <h3 className="font-heading text-base font-semibold">Attachments</h3>
        <p className="text-xs text-muted-foreground">
          Proof of work (images, PDF, docs — max 10MB)
        </p>
      </div>

      <ul className="space-y-2">
        {files.length === 0 ? (
          <li className="py-4 text-center text-sm text-muted-foreground">
            No files uploaded
          </li>
        ) : (
          files.map((file) => (
            <li key={file.id}>
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm hover:bg-muted/40"
              >
                {file.is_image ? (
                  <Paperclip className="size-3.5 text-primary" />
                ) : (
                  <FileText className="size-3.5 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1 truncate font-medium text-primary">
                  {file.original_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {file.human_size}
                </span>
              </a>
            </li>
          ))
        )}
      </ul>

      {canUpload ? (
        <div
          className={
            dragging
              ? 'rounded-lg border border-primary bg-primary/5 p-4'
              : 'rounded-lg border border-dashed border-border p-4'
          }
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            onChange={(e) => {
              handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={mutation.isPending}
            onClick={() => inputRef.current?.click()}
          >
            {mutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            Upload file
          </Button>
        </div>
      ) : null}
    </div>
  )
}
