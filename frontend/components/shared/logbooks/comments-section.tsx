'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'
import {
  commentSchema,
  type CommentFormData,
} from '@/lib/validations/logbooks'
import type { Comment } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function CommentsSection({
  comments,
  onSubmit,
  queryKeysToInvalidate,
  locked,
}: {
  comments: Comment[]
  onSubmit: (data: CommentFormData) => Promise<Comment>
  queryKeysToInvalidate: unknown[][]
  locked?: boolean
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: '' },
  })

  const mutation = useMutation({
    mutationFn: onSubmit,
    onSuccess: () => {
      toast.success('Comment added')
      reset({ body: '' })
      for (const key of queryKeysToInvalidate) {
        queryClient.invalidateQueries({ queryKey: key })
      }
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to add comment'
      toast.error(msg)
    },
  })

  return (
    <div className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-border/80">
      <div>
        <h3 className="font-heading text-base font-semibold">Comments</h3>
        <p className="text-xs text-muted-foreground">
          Discussion between interns and admins
        </p>
      </div>

      <ul className="max-h-72 space-y-3 overflow-y-auto">
        {comments.length === 0 ? (
          <li className="py-6 text-center text-sm text-muted-foreground">
            No comments yet
          </li>
        ) : (
          comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-lg border border-border/70 px-3 py-2"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium">
                  {comment.user?.name ?? 'User'}
                </p>
                <time className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleString()}
                </time>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {comment.body}
              </p>
            </li>
          ))
        )}
      </ul>

      {!locked ? (
        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="space-y-2"
        >
          <Label htmlFor="comment-body">Add a comment</Label>
          <Textarea
            id="comment-body"
            rows={3}
            placeholder="Write a note…"
            {...register('body')}
          />
          {errors.body && (
            <p className="text-sm text-destructive">{errors.body.message}</p>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={mutation.isPending}
            className="gap-1.5"
          >
            {mutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            Post comment
          </Button>
        </form>
      ) : null}
    </div>
  )
}
