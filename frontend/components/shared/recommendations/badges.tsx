import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { RecommendationStatus } from '@/types'

export function recommendationStatusBadgeClass(
  status: RecommendationStatus
): string {
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

export function RecommendationStatusBadge({
  status,
  label,
}: {
  status: RecommendationStatus
  label?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-md capitalize',
        recommendationStatusBadgeClass(status)
      )}
    >
      {label ?? status}
    </Badge>
  )
}
