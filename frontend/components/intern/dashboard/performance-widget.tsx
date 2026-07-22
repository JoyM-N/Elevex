import { Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toScore } from '@/components/intern/dashboard/format'
import type { InternDashboardPerformance, PerformanceGrade } from '@/types'
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

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value.toFixed(0)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  )
}

export function PerformanceWidget({
  performance,
}: {
  performance: InternDashboardPerformance | null
}) {
  return (
    <div className="flex h-full flex-col rounded-xl bg-card p-4 shadow-sm shadow-primary/5 ring-1 ring-border/80">
      <div className="mb-4">
        <h3 className="font-heading text-base font-semibold tracking-tight">
          Performance
        </h3>
        <p className="text-xs text-muted-foreground">Latest scored metrics</p>
      </div>

      {!performance ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Trophy className="size-4" />
          </div>
          <p className="text-sm text-muted-foreground">
            No performance data yet
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-heading text-3xl font-bold text-primary">
                {toScore(performance.overall_score).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">Overall score</p>
            </div>
            <Badge
              variant="outline"
              className={cn('rounded-md', gradeClass(performance.grade))}
            >
              {performance.grade}
            </Badge>
          </div>

          <div className="space-y-3">
            <ScoreRow
              label="Completion"
              value={toScore(performance.completion_rate)}
            />
            <ScoreRow
              label="Deadlines"
              value={toScore(performance.deadline_score)}
            />
            <ScoreRow
              label="Consistency"
              value={toScore(performance.consistency_score)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
