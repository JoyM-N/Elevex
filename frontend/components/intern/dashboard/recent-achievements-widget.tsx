import Link from 'next/link'
import { ArrowRight, Award } from 'lucide-react'
import { formatShortDate } from '@/components/intern/dashboard/format'
import type { InternDashboardAchievement } from '@/types'

export function RecentAchievementsWidget({
  items,
}: {
  items: InternDashboardAchievement[]
}) {
  return (
    <div className="h-full rounded-xl bg-card p-4 shadow-sm shadow-primary/5 ring-1 ring-border/80">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-heading text-base font-semibold tracking-tight">
            Recent achievements
          </h3>
          <p className="text-xs text-muted-foreground">Latest awards</p>
        </div>
        <Link
          href="/intern/performance"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <Award className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No achievements yet</p>
        </div>
      ) : (
        <ul className="divide-y divide-border/70">
          {items.map((item, index) => (
            <li
              key={`${item.name}-${item.awarded_at}-${index}`}
              className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/60 text-sm">
                {item.icon ? (
                  <span aria-hidden>{item.icon}</span>
                ) : (
                  <Award className="size-4 text-accent-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatShortDate(item.awarded_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
