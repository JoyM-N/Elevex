'use client'

import { ChangePasswordForm } from '@/components/shared/profile/change-password-form'

export default function AdminChangePasswordPage() {
  return (
    <div className="page-enter space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Change password
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose a strong password you have not used elsewhere
        </p>
      </div>
      <ChangePasswordForm />
    </div>
  )
}
