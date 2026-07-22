import Link from 'next/link'
import { ArrowRight, CalendarClock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatShortDate } from '@/components/intern/dashboard/format'
import type { InternDashboardDeadline, TaskPriority, TaskStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  in_review: 'In review',
  completed: 'Completed',
  blocked: 'Blocked',
  cancelled: 'Cancelled',
}

function priorityClass(priority: TaskPriority): string {
  switch (priority) {
    case 'critical':
      return 'bg-orange/15 text-orange border-transparent'
    case 'high':
      return 'bg-accent/70 text-accent-foreground border-transparent'
    case 'medium':
      return 'bg-secondary text-secondary-foreground border-transparent'
    default:
      return 'bg-muted text-muted-foreground border-transparent'
  }
}

export function UpcomingDeadlinesWidget({
  items,
}: {
  items: InternDashboardDeadline[]
}) {
  return (
    <div className="h-full rounded-xl bg-card p-4 shadow-sm shadow-primary/5 ring-1 ring-border/80">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-heading text-base font-semibold tracking-tight">
            Upcoming deadlines
          </h3>
          <p className="text-xs text-muted-foreground">Next 7 days</p>
        </div>
        <Link
          href="/intern/tasks"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <CalendarClock className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No deadlines this week</p>
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
                  {STATUS_LABELS[item.status]}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge
                  variant="outline"
                  className={cn('rounded-md capitalize', priorityClass(item.priority))}
                >
                  {item.priority}
                </Badge>
                <p className="text-[11px] font-medium text-accent-foreground">
                  {formatShortDate(item.deadline)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
