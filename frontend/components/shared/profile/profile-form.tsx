'use client'

import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Camera, Loader2 } from 'lucide-react'
import { updateProfile, uploadAvatar } from '@/lib/api/auth'
import {
  updateProfileSchema,
  type UpdateProfileData,
} from '@/lib/validations/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { User } from '@/types'

export function ProfileForm({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone ?? '',
    },
  })

  const saveProfile = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(['auth', 'user'], updated)
      toast.success('Profile updated')
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Update failed'
      toast.error(msg)
    },
  })

  const avatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (updated) => {
      queryClient.setQueryData(['auth', 'user'], updated)
      toast.success('Avatar updated')
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Avatar upload failed'
      toast.error(msg)
    },
  })

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={user.name}
                className="size-full object-cover"
              />
            ) : (
              <span className="font-heading text-2xl font-semibold text-muted-foreground">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <Button
            type="button"
            size="icon-xs"
            variant="secondary"
            className="absolute -right-1 -bottom-1 rounded-full"
            disabled={avatarMutation.isPending}
            onClick={() => fileRef.current?.click()}
          >
            {avatarMutation.isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Camera className="size-3" />
            )}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) avatarMutation.mutate(file)
              e.target.value = ''
            }}
          />
        </div>
        <div>
          <p className="font-heading text-lg font-semibold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">{user.role_label}</p>
        </div>
      </div>

      <form
        className="space-y-4 rounded-xl bg-card p-5 ring-1 ring-border/80"
        onSubmit={handleSubmit((data) =>
          saveProfile.mutate({
            name: data.name,
            phone: data.phone || null,
          })
        )}
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
          <Input id="email" value={user.email} disabled />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed here
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register('phone')} placeholder="Optional" />
          {errors.phone ? (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          ) : null}
        </div>

        {user.active_internship ? (
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <p className="font-medium">Active internship</p>
            <p className="text-muted-foreground">
              {user.active_internship.department}
              {user.active_internship.university
                ? ` · ${user.active_internship.university}`
                : ''}
            </p>
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={!isDirty || saveProfile.isPending}
          className="gap-1"
        >
          {saveProfile.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Save changes
        </Button>
      </form>
    </div>
  )
}
