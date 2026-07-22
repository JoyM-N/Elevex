import Link from 'next/link'
import { ArrowRight, ListTodo } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { AdminDashboardRecentTask, TaskStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  in_review: 'In review',
  completed: 'Completed',
  blocked: 'Blocked',
  cancelled: 'Cancelled',
}

function statusClass(status: TaskStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-primary/10 text-primary border-transparent'
    case 'in_progress':
      return 'bg-secondary text-secondary-foreground border-transparent'
    case 'in_review':
      return 'bg-accent/70 text-accent-foreground border-transparent'
    case 'blocked':
      return 'bg-orange/15 text-orange border-transparent'
    case 'cancelled':
      return 'bg-muted text-muted-foreground border-transparent'
    default:
      return 'bg-muted text-muted-foreground border-transparent'
  }
}

function formatDate(value: string | null): string {
  if (!value) return 'No deadline'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function RecentTasksWidget({
  items,
}: {
  items: AdminDashboardRecentTask[]
}) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-border/80 shadow-sm shadow-primary/5 h-full">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-heading text-base font-semibold tracking-tight">
            Recent tasks
          </h3>
          <p className="text-xs text-muted-foreground">Latest assignments</p>
        </div>
        <Link
          href="/admin/tasks"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <ListTodo className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No tasks yet</p>
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
                <p className="truncate text-xs text-muted-foreground">
                  {item.assigned_to}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge
                  variant="outline"
                  className={cn('rounded-md', statusClass(item.status))}
                >
                  {STATUS_LABELS[item.status]}
                </Badge>
                <p className="text-[11px] text-muted-foreground">
                  {formatDate(item.deadline)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
