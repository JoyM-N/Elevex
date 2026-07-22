import type { InternDashboard } from '@/types'
import { toScore } from '@/components/intern/dashboard/format'
import { cn } from '@/lib/utils'

export function TaskProgressWidget({
  tasks,
}: {
  tasks: InternDashboard['tasks']
}) {
  // Status buckets only — overdue is not exclusive (can also be in_progress),
  // so it must not take a slice of the progress bar.
  const other = Math.max(tasks.total - tasks.completed - tasks.in_progress, 0)
  const segments = [
    {
      key: 'completed',
      label: 'Completed',
      count: tasks.completed,
      className: 'bg-primary',
    },
    {
      key: 'in_progress',
      label: 'In progress',
      count: tasks.in_progress,
      className: 'bg-[var(--chart-2)]',
    },
    {
      key: 'other',
      label: 'Other',
      count: other,
      className: 'bg-muted-foreground/30',
    },
  ]

  const totalForBar = Math.max(tasks.total, 1)
  const rate = toScore(tasks.completion_rate)

  return (
    <div className="h-full rounded-xl bg-card p-4 shadow-sm shadow-primary/5 ring-1 ring-border/80">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-base font-semibold tracking-tight">
            Task progress
          </h3>
          <p className="text-xs text-muted-foreground">
            {rate}% complete · {tasks.total} total tasks
          </p>
        </div>
        {tasks.overdue > 0 ? (
          <span className="shrink-0 rounded-md bg-orange/15 px-2 py-1 text-xs font-medium text-orange">
            {tasks.overdue} overdue
          </span>
        ) : null}
      </div>

      {tasks.total === 0 ? (
        <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
          No tasks assigned yet
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex h-3 overflow-hidden rounded-full bg-muted">
            {segments
              .filter((s) => s.count > 0)
              .map((segment) => (
                <div
                  key={segment.key}
                  className={cn('h-full transition-all', segment.className)}
                  style={{
                    width: `${(segment.count / totalForBar) * 100}%`,
                  }}
                  title={`${segment.label}: ${segment.count}`}
                />
              ))}
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {segments.map((segment) => (
              <li
                key={segment.key}
                className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn('size-2.5 rounded-full', segment.className)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {segment.label}
                  </span>
                </div>
                <span className="font-heading text-sm font-semibold text-foreground">
                  {segment.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
