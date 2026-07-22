import { cn } from '@/lib/utils'
import type { PerformanceGrade, PerformanceMetric } from '@/types'

export function gradeClass(grade: PerformanceGrade | string): string {
  switch (grade) {
    case 'Excellent':
      return 'text-primary'
    case 'Good':
      return 'text-foreground'
    case 'Satisfactory':
      return 'text-muted-foreground'
    case 'Needs Improvement':
      return 'text-orange'
    default:
      return 'text-muted-foreground'
  }
}

export function ScoreBars({ metric }: { metric: PerformanceMetric }) {
  const rows = [
    { label: 'Completion', value: Number(metric.completion_rate) },
    { label: 'Deadlines', value: Number(metric.deadline_score) },
    { label: 'Consistency', value: Number(metric.consistency_score) },
    { label: 'Quality', value: Number(metric.quality_score) },
    { label: 'Teamwork', value: Number(metric.teamwork_score) },
  ]

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium">{row.value.toFixed(1)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, Math.max(0, row.value))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function OverallScoreCard({ metric }: { metric: PerformanceMetric }) {
  return (
    <div className="rounded-xl bg-card p-5 ring-1 ring-border/80">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Overall score
      </p>
      <p className="mt-2 font-heading text-4xl font-semibold tracking-tight">
        {Number(metric.overall_score).toFixed(1)}
      </p>
      <p className={cn('mt-1 text-sm font-medium', gradeClass(metric.grade))}>
        {metric.grade}
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        Calculated{' '}
        {metric.calculated_at
          ? new Date(metric.calculated_at).toLocaleString()
          : '—'}
      </p>
    </div>
  )
}
