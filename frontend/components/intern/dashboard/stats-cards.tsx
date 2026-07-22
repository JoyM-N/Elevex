import type { InternDashboard } from '@/types'
import { toScore } from '@/components/intern/dashboard/format'
import { BookOpen, CheckCircle2, ListTodo, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatTile = {
  label: string
  value: number | string
  hint: string
  icon: typeof ListTodo
  accent?: 'default' | 'amber'
}

export function StatsCards({ data }: { data: InternDashboard }) {
  const completion = toScore(data.tasks.completion_rate)
  const hours = toScore(data.logbooks.hours_this_week)
  const overall = data.performance
    ? toScore(data.performance.overall_score).toFixed(1)
    : '—'

  const tiles: StatTile[] = [
    {
      label: 'Completion rate',
      value: `${completion}%`,
      hint: `${data.tasks.completed} of ${data.tasks.total} tasks completed`,
      icon: CheckCircle2,
    },
    {
      label: 'Tasks in progress',
      value: data.tasks.in_progress,
      hint:
        data.tasks.overdue > 0
          ? `${data.tasks.overdue} overdue`
          : `${data.tasks.total} total tasks`,
      icon: ListTodo,
      accent: data.tasks.overdue > 0 ? 'amber' : 'default',
    },
    {
      label: 'Hours this week',
      value: hours,
      hint: `${data.logbooks.draft} draft · ${data.logbooks.approved} approved`,
      icon: BookOpen,
    },
    {
      label: 'Overall score',
      value: overall,
      hint: data.performance
        ? data.performance.grade
        : 'No performance data yet',
      icon: Trophy,
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => {
        const Icon = tile.icon
        return (
          <div
            key={tile.label}
            className={cn(
              'group rounded-xl bg-card p-4 ring-1 ring-border/80 shadow-sm shadow-primary/5',
              'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/10'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {tile.label}
                </p>
                <p className="mt-1 font-heading text-3xl font-semibold tracking-tight text-foreground">
                  {tile.value}
                </p>
                <p
                  className={cn(
                    'mt-1 text-xs',
                    tile.accent === 'amber'
                      ? 'font-medium text-accent-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {tile.hint}
                </p>
              </div>
              <div
                className={cn(
                  'flex size-9 items-center justify-center rounded-lg',
                  tile.accent === 'amber'
                    ? 'bg-accent/70 text-accent-foreground'
                    : 'bg-primary/10 text-primary'
                )}
              >
                <Icon className="size-4" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
