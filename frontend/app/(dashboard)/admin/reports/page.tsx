'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getMonthlyReport,
  getPerformanceReport,
  getWeeklyReport,
} from '@/lib/api/admin/reports'
import { listInterns } from '@/lib/api/admin/projects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

function mondayOf(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function defaultWeekStart() {
  return toDateInput(mondayOf(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
}

function defaultYearMonth() {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-border/80">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 font-heading text-2xl font-semibold tracking-tight">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function PdfDownload({ url }: { url?: string | null }) {
  if (!url) return null
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1"
      render={<a href={url} target="_blank" rel="noreferrer" />}
    >
      <Download className="size-3.5" />
      Download PDF
    </Button>
  )
}

function WeeklyPanel() {
  const [weekStart, setWeekStart] = useState(defaultWeekStart)
  const [activeWeek, setActiveWeek] = useState(defaultWeekStart)

  const query = useQuery({
    queryKey: ['admin', 'reports', 'weekly', activeWeek],
    queryFn: () => getWeeklyReport({ week_start: activeWeek }),
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="week_start">Week starting (Monday)</Label>
          <Input
            id="week_start"
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="w-48"
          />
        </div>
        <Button
          onClick={() => setActiveWeek(weekStart)}
          disabled={query.isFetching && activeWeek === weekStart}
        >
          {query.isFetching ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Generate
        </Button>
        <PdfDownload url={query.data?.pdf_url} />
      </div>

      {query.isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : query.isError ? (
        <div className="rounded-xl bg-card p-6 text-center ring-1 ring-border/80">
          <p className="font-medium">Couldn&apos;t generate weekly report</p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => query.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : query.data ? (
        <>
          <p className="text-sm text-muted-foreground">{query.data.period.label}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              label="Tasks"
              value={query.data.summary.total_tasks}
              hint={`${query.data.summary.completed_tasks} completed`}
            />
            <Stat
              label="Overdue"
              value={query.data.summary.overdue_tasks}
            />
            <Stat
              label="Logbooks"
              value={query.data.summary.total_logbooks}
              hint={`${query.data.summary.approved_logbooks} approved`}
            />
            <Stat
              label="Hours worked"
              value={query.data.summary.total_hours}
            />
          </div>
          <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Intern</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Logbooks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.interns.map((intern) => (
                  <TableRow key={intern.id}>
                    <TableCell className="font-medium">{intern.name}</TableCell>
                    <TableCell>{intern.tasks_this_week ?? 0}</TableCell>
                    <TableCell>{intern.logbooks_this_week ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : null}
    </div>
  )
}

function MonthlyPanel() {
  const defaults = useMemo(() => defaultYearMonth(), [])
  const [year, setYear] = useState(String(defaults.year))
  const [month, setMonth] = useState(String(defaults.month))
  const [active, setActive] = useState(defaults)

  const query = useQuery({
    queryKey: ['admin', 'reports', 'monthly', active],
    queryFn: () =>
      getMonthlyReport({ year: active.year, month: active.month }),
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="report_year">Year</Label>
          <Input
            id="report_year"
            type="number"
            min={2020}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-28"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="report_month">Month</Label>
          <Input
            id="report_month"
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-24"
          />
        </div>
        <Button
          onClick={() =>
            setActive({ year: Number(year), month: Number(month) })
          }
        >
          {query.isFetching ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Generate
        </Button>
        <PdfDownload url={query.data?.pdf_url} />
      </div>

      {query.isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : query.isError ? (
        <div className="rounded-xl bg-card p-6 text-center ring-1 ring-border/80">
          <p className="font-medium">Couldn&apos;t generate monthly report</p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => query.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : query.data ? (
        <>
          <p className="text-sm text-muted-foreground">{query.data.period.label}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Active projects"
              value={query.data.projects.active}
              hint={`${query.data.projects.completed} completed`}
            />
            <Stat
              label="Task completion"
              value={`${query.data.tasks.completion_rate}%`}
              hint={`${query.data.tasks.completed}/${query.data.tasks.total}`}
            />
            <Stat
              label="Logbook approval"
              value={`${query.data.logbooks.approval_rate}%`}
              hint={`${query.data.logbooks.approved}/${query.data.logbooks.total}`}
            />
            <Stat label="Hours" value={query.data.logbooks.total_hours} />
          </div>

          {(query.data.top_performers ?? []).length > 0 ? (
            <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Top performers</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.data.top_performers.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.user && 'name' in row.user
                          ? row.user.name
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {Number(row.overall_score).toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function PerformancePanel() {
  const [internId, setInternId] = useState('')
  const [activeId, setActiveId] = useState<number | null>(null)

  const internsQuery = useQuery({
    queryKey: ['admin', 'interns', { per_page: 100 }],
    queryFn: () => listInterns({ per_page: 100 }),
  })

  const reportMutation = useMutation({
    mutationFn: (id: number) => getPerformanceReport(id),
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Could not generate performance report'
      toast.error(msg)
    },
  })

  const report = reportMutation.data

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="perf_intern">Intern</Label>
          <select
            id="perf_intern"
            className="flex h-8 w-full min-w-[220px] rounded-lg border border-input bg-background px-2.5 text-sm"
            value={internId}
            onChange={(e) => setInternId(e.target.value)}
          >
            <option value="">Select intern…</option>
            {(internsQuery.data?.data ?? []).map((intern) => (
              <option key={intern.id} value={intern.id}>
                {intern.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          disabled={!internId || reportMutation.isPending}
          onClick={() => {
            const id = Number(internId)
            setActiveId(id)
            reportMutation.mutate(id)
          }}
        >
          {reportMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Generate
        </Button>
        <PdfDownload url={report?.pdf_url} />
      </div>

      {reportMutation.isPending && activeId ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : report ? (
        <>
          <div>
            <h3 className="font-heading text-lg font-semibold">
              {'name' in report.intern ? report.intern.name : 'Intern'}
            </h3>
            <p className="text-sm text-muted-foreground">Grade: {report.grade}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Tasks" value={report.task_stats.total} hint={`${report.task_stats.completed} done`} />
            <Stat label="In progress" value={report.task_stats.in_progress} />
            <Stat label="Overdue" value={report.task_stats.overdue} />
            <Stat
              label="Logbooks"
              value={report.logbook_stats.total}
              hint={`${report.logbook_stats.approved} approved`}
            />
          </div>
          {report.metric ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Stat label="Overall" value={Number(report.metric.overall_score).toFixed(1)} />
              <Stat label="Completion" value={Number(report.metric.completion_rate).toFixed(1)} />
              <Stat label="Deadline" value={Number(report.metric.deadline_score).toFixed(1)} />
              <Stat label="Consistency" value={Number(report.metric.consistency_score).toFixed(1)} />
              <Stat label="Quality" value={Number(report.metric.quality_score).toFixed(1)} />
              <Stat label="Teamwork" value={Number(report.metric.teamwork_score).toFixed(1)} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No performance metrics calculated yet for this intern.
            </p>
          )}
        </>
      ) : null}
    </div>
  )
}

export default function AdminReportsPage() {
  return (
    <div className="page-enter space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Reports
        </h2>
        <p className="text-sm text-muted-foreground">
          Generate weekly, monthly, and intern performance PDFs on demand
        </p>
      </div>

      <Tabs defaultValue="weekly">
        <TabsList>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly" className="mt-4">
          <WeeklyPanel />
        </TabsContent>
        <TabsContent value="monthly" className="mt-4">
          <MonthlyPanel />
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <PerformancePanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
