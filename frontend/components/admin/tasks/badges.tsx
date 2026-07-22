import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TaskPriority, TaskStatus, TaskType } from '@/types'
import { priorityBadgeClass } from '@/components/admin/projects/badges'

export function taskStatusBadgeClass(status: TaskStatus): string {
  switch (status) {
    case 'todo':
      return 'bg-muted text-muted-foreground border-transparent'
    case 'in_progress':
      return 'bg-primary/10 text-primary border-transparent'
    case 'in_review':
      return 'bg-accent/70 text-accent-foreground border-transparent'
    case 'completed':
      return 'bg-secondary text-secondary-foreground border-transparent'
    case 'blocked':
      return 'bg-orange/15 text-orange border-transparent'
    case 'cancelled':
      return 'bg-destructive/10 text-destructive border-transparent'
    default:
      return ''
  }
}

export function TaskStatusBadge({
  status,
  label,
}: {
  status: TaskStatus
  label?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn('rounded-md capitalize', taskStatusBadgeClass(status))}
    >
      {label ?? status.replaceAll('_', ' ')}
    </Badge>
  )
}

export function TaskPriorityBadge({
  priority,
  label,
}: {
  priority: TaskPriority
  label?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn('rounded-md capitalize', priorityBadgeClass(priority))}
    >
      {label ?? priority}
    </Badge>
  )
}

export function TaskTypeBadge({
  type,
  label,
}: {
  type: TaskType
  label?: string
}) {
  return (
    <Badge variant="outline" className="rounded-md capitalize">
      {label ?? type.replaceAll('_', ' ')}
    </Badge>
  )
}
