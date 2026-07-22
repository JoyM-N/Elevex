'use client'

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { ProjectStatusKey } from '@/types'

const STATUS_ORDER: ProjectStatusKey[] = [
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
]

const STATUS_LABELS: Record<ProjectStatusKey, string> = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const chartConfig = {
  count: { label: 'Projects' },
  planning: { label: 'Planning', color: 'var(--chart-4)' },
  active: { label: 'Active', color: 'var(--chart-1)' },
  on_hold: { label: 'On hold', color: 'var(--chart-2)' },
  completed: { label: 'Completed', color: 'var(--chart-3)' },
  cancelled: { label: 'Cancelled', color: 'var(--chart-5)' },
} satisfies ChartConfig

export function ProjectsStatusChart({
  byStatus,
}: {
  byStatus: Partial<Record<ProjectStatusKey, number>>
}) {
  const data = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: byStatus[status] ?? 0,
  }))

  const hasAny = data.some((d) => d.count > 0)

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-border/80 shadow-sm shadow-primary/5 h-full">
      <div className="mb-4">
        <h3 className="font-heading text-base font-semibold tracking-tight">
          Projects by status
        </h3>
        <p className="text-xs text-muted-foreground">
          Distribution across all projects
        </p>
      </div>

      {!hasAny ? (
        <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
          No projects yet
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              fontSize={11}
              width={28}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={`var(--color-${entry.status})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  )
}
