import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import type { AdminDashboardPendingLogbook } from '@/types'

function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function PendingLogbooksWidget({
  items,
}: {
  items: AdminDashboardPendingLogbook[]
}) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-border/80 shadow-sm shadow-primary/5 h-full">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-heading text-base font-semibold tracking-tight">
            Pending logbooks
          </h3>
          <p className="text-xs text-muted-foreground">Awaiting your review</p>
        </div>
        <Link
          href="/admin/logbooks"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <BookOpen className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">All caught up</p>
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
                  {item.intern_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.task_title}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-medium text-accent-foreground">
                  {formatDate(item.date)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatDate(item.submitted_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
