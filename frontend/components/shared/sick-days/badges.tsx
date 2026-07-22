import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SickDayStatus } from '@/types'

export function sickDayStatusBadgeClass(status: SickDayStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-accent/70 text-accent-foreground border-transparent'
    case 'approved':
      return 'bg-secondary text-secondary-foreground border-transparent'
    case 'rejected':
      return 'bg-destructive/10 text-destructive border-transparent'
    default:
      return ''
  }
}

export function SickDayStatusBadge({ status }: { status: SickDayStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn('rounded-md capitalize', sickDayStatusBadgeClass(status))}
    >
      {status}
    </Badge>
  )
}
