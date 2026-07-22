import { Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { AdminDashboardTopPerformer, PerformanceGrade } from '@/types'
import { cn } from '@/lib/utils'

function gradeClass(grade: PerformanceGrade): string {
  switch (grade) {
    case 'Excellent':
      return 'bg-primary/15 text-primary border-transparent'
    case 'Good':
      return 'bg-secondary text-secondary-foreground border-transparent'
    case 'Satisfactory':
      return 'bg-accent/70 text-accent-foreground border-transparent'
    case 'Needs Improvement':
      return 'bg-orange/15 text-orange border-transparent'
    default:
      return ''
  }
}

export function TopPerformerWidget({
  performer,
}: {
  performer: AdminDashboardTopPerformer | null
}) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-border/80 shadow-sm shadow-primary/5 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-heading text-base font-semibold tracking-tight">
          Top performer
        </h3>
        <p className="text-xs text-muted-foreground">
          Highest overall score (0–100). Low numbers usually mean sparse
          completed work or missing evaluations — not a broken meter.
        </p>
      </div>

      {!performer ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Trophy className="size-4" />
          </div>
          <p className="text-sm text-muted-foreground">
            No performance data yet
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-accent/60 text-accent-foreground shadow-sm">
            <Trophy className="size-6" />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold tracking-tight text-foreground">
              {performer.name}
            </p>
            <p className="mt-1 font-heading text-3xl font-bold text-primary">
              {Number(performer.overall_score).toFixed(1)}
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                / 100
              </span>
            </p>
          </div>
          <Badge
            className={cn('rounded-md', gradeClass(performer.grade))}
            variant="outline"
          >
            {performer.grade}
          </Badge>
        </div>
      )}
    </div>
  )
}
