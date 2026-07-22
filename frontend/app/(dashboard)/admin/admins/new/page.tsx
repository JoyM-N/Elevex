'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createAdmin } from '@/lib/api/admin/users'
import {
  createAdminSchema,
  type CreateAdminData,
} from '@/lib/validations/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CreateAdminPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateAdminData>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { is_active: true },
  })

  const mutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      toast.success('Admin created')
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'admins'] })
      router.push('/admin/admins')
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> }
        }
      }
      const fieldErrors = err.response?.data?.errors
      if (fieldErrors) {
        for (const [key, messages] of Object.entries(fieldErrors)) {
          setError(key as keyof CreateAdminData, { message: messages[0] })
        }
        return
      }
      toast.error(err.response?.data?.message || 'Could not create admin')
    },
  })

  return (
    <div className="page-enter mx-auto max-w-lg space-y-6">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href="/admin/admins" />}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Create admin
          </h2>
          <p className="text-sm text-muted-foreground">
            They can manage projects, tasks, and internships
          </p>
        </div>
      </div>

      <form
        className="space-y-4 rounded-xl bg-card p-5 ring-1 ring-border/80"
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register('name')} />
          {errors.name ? (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register('phone')} placeholder="Optional" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
            />
            <button
              type="button"
              className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
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
          <Label htmlFor="password_confirmation">Confirm password</Label>
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
          Create admin
        </Button>
      </form>
    </div>
  )
}
