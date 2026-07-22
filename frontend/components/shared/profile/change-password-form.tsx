'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { changePassword } from '@/lib/api/auth'
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password updated')
      reset()
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: {
            message?: string
            errors?: Record<string, string[]>
          }
        }
      }
      const fieldErrors = err.response?.data?.errors
      if (fieldErrors?.current_password) {
        setError('current_password', {
          message: fieldErrors.current_password[0],
        })
        return
      }
      toast.error(err.response?.data?.message || 'Could not change password')
    },
  })

  return (
    <form
      className="mx-auto max-w-md space-y-4 rounded-xl bg-card p-5 ring-1 ring-border/80"
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
    >
      <div className="space-y-1.5">
        <Label htmlFor="current_password">Current password</Label>
        <div className="relative">
          <Input
            id="current_password"
            type={showCurrent ? 'text' : 'password'}
            {...register('current_password')}
          />
          <button
            type="button"
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
            onClick={() => setShowCurrent((v) => !v)}
          >
            {showCurrent ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.current_password ? (
          <p className="text-xs text-destructive">
            {errors.current_password.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showNew ? 'text' : 'password'}
            {...register('password')}
          />
          <button
            type="button"
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
            onClick={() => setShowNew((v) => !v)}
          >
            {showNew ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.password ? (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password_confirmation">Confirm new password</Label>
        <Input
          id="password_confirmation"
          type="password"
          {...register('password_confirmation')}
        />
        {errors.password_confirmation ? (
          <p className="text-xs text-destructive">
            {errors.password_confirmation.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={mutation.isPending} className="gap-1">
        {mutation.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : null}
        Update password
      </Button>
    </form>
  )
}
