'use client'

import { HolidaysPanel } from '@/components/admin/settings/holidays-panel'

export default function AdminHolidaysPage() {
  return (
    <div className="page-enter space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Public holidays
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage holidays excluded from attendance and consistency scoring
        </p>
      </div>
      <HolidaysPanel />
    </div>
  )
}
