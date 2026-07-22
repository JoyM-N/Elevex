'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { login } from '@/lib/api/auth'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { useAuth } from '@/lib/hooks/use-auth'
import { getDashboardHome } from '@/lib/auth/roles'
import { setSessionHint } from '@/lib/auth/session-hint'
import type { User } from '@/types'
import Link from 'next/link'

/**
 * Login Page
 *
 * Handles user authentication.
 * On success — redirects to the correct dashboard based on role.
 * If a valid session already exists, bounce to the role dashboard.
 */
export default function LoginPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)
  const bounced = useRef(false)

  const { user, isLoading: authLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (authLoading || bounced.current || !isAuthenticated || !user) return
    bounced.current = true
    router.replace(getDashboardHome(user.role))
  }, [authLoading, isAuthenticated, user, router])

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (loggedInUser: User) => {
      setSessionHint()
      queryClient.setQueryData(['auth', 'user'], loggedInUser)

      toast.success(`Welcome back, ${loggedInUser.name}!`)

      if (loggedInUser.role === 'intern') {
        router.push('/intern/dashboard')
      } else {
        router.push('/admin/dashboard')
      }
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { errors?: { email?: string[] }; message?: string } }
      }
      const apiErrors = err.response?.data?.errors

      if (apiErrors?.email) {
        setError('email', { message: apiErrors.email[0] })
      } else {
        toast.error(err.response?.data?.message || 'Login failed. Please try again.')
      }
    },
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  if (authLoading || isAuthenticated) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in to your account</CardTitle>
        <CardDescription>
          Enter your email and password to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
