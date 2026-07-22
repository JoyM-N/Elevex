import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { LogbookStatus } from '@/types'

export function logbookStatusBadgeClass(status: LogbookStatus): string {
  switch (status) {
    case 'draft':
      return 'bg-muted text-muted-foreground border-transparent'
    case 'submitted':
      return 'bg-primary/10 text-primary border-transparent'
    case 'approved':
      return 'bg-secondary text-secondary-foreground border-transparent'
    case 'revision_needed':
      return 'bg-orange/15 text-orange border-transparent'
    case 'rejected':
      return 'bg-destructive/10 text-destructive border-transparent'
    default:
      return ''
  }
}

export function LogbookStatusBadge({
  status,
  label,
}: {
  status: LogbookStatus
  label?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn('rounded-md capitalize', logbookStatusBadgeClass(status))}
    >
      {label ?? status.replaceAll('_', ' ')}
    </Badge>
  )
}
