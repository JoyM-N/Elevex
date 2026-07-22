'use client'

import { useState } from 'react'
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
import { login, logout as apiLogout } from '@/lib/api/auth'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { useAuth } from '@/lib/hooks/use-auth'
import { getDashboardHome } from '@/lib/auth/roles'
import {
  clearSessionHint,
  setSessionHint,
} from '@/lib/auth/session-hint'
import type { User } from '@/types'
import Link from 'next/link'

async function clearBrowserSession() {
  try {
    await apiLogout()
  } catch {
    // May already be logged out
  }
  try {
    await fetch('/api/auth/clear-session', {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // Best-effort cookie clear
  }
  clearSessionHint()
}

/**
 * Login Page
 *
 * Does not auto-bounce an existing session — that trapped users who were
 * still logged in as an intern and could not switch to admin.
 */
export default function LoginPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)
  const [switchingAccount, setSwitchingAccount] = useState(false)

  const { user, isLoading: authLoading, isAuthenticated } = useAuth()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      // Drop any previous Sanctum session so role cannot stick from last login
      await clearBrowserSession()
      queryClient.setQueryData(['auth', 'user'], null)
      return login(data)
    },
    onSuccess: (loggedInUser: User) => {
      setSessionHint()
      queryClient.setQueryData(['auth', 'user'], loggedInUser)
      setSwitchingAccount(false)

      toast.success(`Welcome back, ${loggedInUser.name}!`)
      router.replace(getDashboardHome(loggedInUser.role))
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

  const switchAccountMutation = useMutation({
    mutationFn: clearBrowserSession,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'user'], null)
      setSwitchingAccount(true)
    },
    onError: () => {
      queryClient.setQueryData(['auth', 'user'], null)
      setSwitchingAccount(true)
    },
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  if (authLoading && !switchingAccount) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  if (isAuthenticated && user && !switchingAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Already signed in</CardTitle>
          <CardDescription>
            You are signed in as <strong>{user.email}</strong> ({user.role_label}).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            className="w-full"
            onClick={() => router.replace(getDashboardHome(user.role))}
          >
            Continue to dashboard
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={switchAccountMutation.isPending}
            onClick={() => switchAccountMutation.mutate()}
          >
            {switchAccountMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              'Use a different account'
            )}
          </Button>
        </CardContent>
      </Card>
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
              placeholder="admin@elevex.com"
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
