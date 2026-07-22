'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { forgotPassword } from '@/lib/api/auth'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth'
import Link from 'next/link'

/**
 * Forgot Password Page
 *
 * Sends a password reset link to the provided email.
 * Shows success state after submission so user knows
 * to check their email.
 *
 * In development: the reset link appears in Laravel logs
 * (storage/logs/laravel.log) since MAIL_MAILER=log
 */
export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      setSubmitted(true)
    },
    onError: (error: any) => {
      const apiErrors = error.response?.data?.errors
      if (apiErrors?.email) {
        setError('email', { message: apiErrors.email[0] })
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    },
  })

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold">Check your email</h2>
          <p className="text-gray-500 text-sm">
            We sent a password reset link to your email address.
            Check your inbox and follow the instructions.
          </p>
          <p className="text-xs text-gray-400">
            In development: check storage/logs/laravel.log for the reset link.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot your password?</CardTitle>
        <CardDescription>
          Enter your email and we will send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-4">

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

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send reset link'
            )}
          </Button>

          <Link href="/login">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </Link>

        </form>
      </CardContent>
    </Card>
  )
}