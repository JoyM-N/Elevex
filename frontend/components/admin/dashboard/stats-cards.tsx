import type { AdminDashboard } from '@/types'
import { BookOpen, FolderKanban, ListTodo, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatTile = {
  label: string
  value: number | string
  hint: string
  icon: typeof Users
  accent?: 'default' | 'amber' | 'orange'
}

export function StatsCards({ data }: { data: AdminDashboard }) {
  const tiles: StatTile[] = [
    {
      label: 'Active interns',
      value: data.interns.active,
      hint: `${data.interns.total} total`,
      icon: Users,
    },
    {
      label: 'Active projects',
      value: data.projects.active,
      hint: `${data.projects.total} total`,
      icon: FolderKanban,
    },
    {
      label: 'Tasks due this week',
      value: data.tasks.due_this_week,
      hint:
        data.tasks.overdue > 0
          ? `${data.tasks.overdue} overdue`
          : 'On track',
      icon: ListTodo,
      accent: data.tasks.overdue > 0 ? 'amber' : 'default',
    },
    {
      label: 'Pending logbooks',
      value: data.logbooks.pending_review,
      hint: `${data.logbooks.approved_today} approved today`,
      icon: BookOpen,
      accent: data.logbooks.pending_review > 0 ? 'amber' : 'default',
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
                    tile.accent === 'amber' && 'font-medium text-accent-foreground',
                    tile.accent === 'orange' && 'font-medium text-orange',
                    tile.accent === 'default' && 'text-muted-foreground'
                  )}
                >
                  {tile.hint}
                </p>
              </div>
              <div
                className={cn(
                  'flex size-9 items-center justify-center rounded-lg transition-colors',
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
