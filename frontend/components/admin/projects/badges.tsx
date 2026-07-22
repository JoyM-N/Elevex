import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ProjectPriority, ProjectStatus, MilestoneStatus } from '@/types'

export function statusBadgeClass(status: ProjectStatus | MilestoneStatus): string {
  switch (status) {
    case 'active':
    case 'in_progress':
      return 'bg-primary/10 text-primary border-transparent'
    case 'completed':
      return 'bg-secondary text-secondary-foreground border-transparent'
    case 'planning':
    case 'pending':
      return 'bg-accent/70 text-accent-foreground border-transparent'
    case 'on_hold':
      return 'bg-muted text-muted-foreground border-transparent'
    case 'cancelled':
      return 'bg-destructive/10 text-destructive border-transparent'
    default:
      return ''
  }
}

export function priorityBadgeClass(priority: ProjectPriority): string {
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

export function StatusBadge({
  status,
  label,
}: {
  status: ProjectStatus | MilestoneStatus
  label?: string
}) {
  return (
    <Badge variant="outline" className={cn('rounded-md capitalize', statusBadgeClass(status))}>
      {label ?? status.replaceAll('_', ' ')}
    </Badge>
  )
}

export function PriorityBadge({
  priority,
  label,
}: {
  priority: ProjectPriority
  label?: string
}) {
  return (
    <Badge variant="outline" className={cn('rounded-md capitalize', priorityBadgeClass(priority))}>
      {label ?? priority}
    </Badge>
  )
}
