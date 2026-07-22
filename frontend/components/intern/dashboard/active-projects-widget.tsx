import { FolderKanban } from 'lucide-react'
import {
  formatShortDate,
  humanizeKey,
} from '@/components/intern/dashboard/format'
import type { InternDashboardActiveProject } from '@/types'

export function ActiveProjectsWidget({
  items,
}: {
  items: InternDashboardActiveProject[]
}) {
  return (
    <div className="h-full rounded-xl bg-card p-4 shadow-sm shadow-primary/5 ring-1 ring-border/80">
      <div className="mb-3">
        <h3 className="font-heading text-base font-semibold tracking-tight">
          Active projects
        </h3>
        <p className="text-xs text-muted-foreground">Your current assignments</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <FolderKanban className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No active projects</p>
        </div>
      ) : (
        <ul className="divide-y divide-border/70">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {humanizeKey(String(item.team_role))}
                </p>
              </div>
              <p className="shrink-0 text-[11px] text-muted-foreground">
                Ends {formatShortDate(item.end_date)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
