'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { listAdmins } from '@/lib/api/admin/users'
import { onboardIntern } from '@/lib/api/admin/users'
import { useAuth } from '@/lib/hooks/use-auth'
import {
  onboardInternSchema,
  type OnboardInternData,
} from '@/lib/validations/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function OnboardInternPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const isSuperAdmin = user?.role === 'super_admin'

  const adminsQuery = useQuery({
    queryKey: ['super-admin', 'admins', { per_page: 100 }],
    queryFn: () => listAdmins({ per_page: 100 }),
    enabled: isSuperAdmin,
  })

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<OnboardInternData>({
    resolver: zodResolver(onboardInternSchema),
    defaultValues: {
      supervisor_id: user?.id,
    },
  })

  const mutation = useMutation({
    mutationFn: onboardIntern,
    onSuccess: (intern) => {
      toast.success('Intern onboarded')
      queryClient.invalidateQueries({ queryKey: ['admin', 'interns'] })
      router.push(`/admin/interns/${intern.id}`)
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
          setError(key as keyof OnboardInternData, { message: messages[0] })
        }
        return
      }
      toast.error(err.response?.data?.message || 'Could not onboard intern')
    },
  })

  return (
    <div className="page-enter mx-auto max-w-2xl space-y-6">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href="/admin/interns" />}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Onboard intern
          </h2>
          <p className="text-sm text-muted-foreground">
            Creates their login account and an active internship (department,
            dates, and supervisor) in one step
          </p>
        </div>
      </div>

      <form
        className="space-y-6 rounded-xl bg-card p-5 ring-1 ring-border/80"
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
      >
        <fieldset className="space-y-4">
          <legend className="font-heading text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Account
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Full name</Label>
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
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
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
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-heading text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Internship
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" {...register('department')} />
              {errors.department ? (
                <p className="text-xs text-destructive">
                  {errors.department.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                {...register('university')}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="student_id">Student ID</Label>
              <Input
                id="student_id"
                {...register('student_id')}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="start_date">Start date</Label>
              <Input id="start_date" type="date" {...register('start_date')} />
              {errors.start_date ? (
                <p className="text-xs text-destructive">
                  {errors.start_date.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end_date">End date</Label>
              <Input id="end_date" type="date" {...register('end_date')} />
              {errors.end_date ? (
                <p className="text-xs text-destructive">
                  {errors.end_date.message}
                </p>
              ) : null}
            </div>
            {isSuperAdmin ? (
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="supervisor_id">Supervisor</Label>
                <select
                  id="supervisor_id"
                  className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
                  {...register('supervisor_id', { valueAsNumber: true })}
                >
                  <option value={user?.id}>Me ({user?.name})</option>
                  {(adminsQuery.data?.data ?? []).map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <input type="hidden" {...register('supervisor_id', { valueAsNumber: true })} />
            )}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                {...register('notes')}
                placeholder="Optional"
              />
            </div>
          </div>
        </fieldset>

        <Button type="submit" disabled={mutation.isPending} className="gap-1">
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Onboard intern
        </Button>
      </form>
    </div>
  )
}
