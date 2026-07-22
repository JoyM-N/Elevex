'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { ProfileForm } from '@/components/shared/profile/profile-form'
import { Skeleton } from '@/components/ui/skeleton'

export default function InternProfilePage() {
  const { user, isLoading } = useAuth()

  if (isLoading || !user) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full max-w-lg rounded-xl" />
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Profile
        </h2>
        <p className="text-sm text-muted-foreground">
          Update your name, phone, and avatar
        </p>
      </div>
      <ProfileForm user={user} />
    </div>
  )
}
