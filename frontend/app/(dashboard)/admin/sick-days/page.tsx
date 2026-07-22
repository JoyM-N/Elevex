'use client'

import { SickDaysPanel } from '@/components/admin/settings/sick-days-panel'

export default function AdminSickDaysPage() {
  return (
    <div className="page-enter space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Sick days
        </h2>
        <p className="text-sm text-muted-foreground">
          Review intern sick day requests — approve or reject with optional notes
        </p>
      </div>
      <SickDaysPanel />
    </div>
  )
}
