'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { listEvaluations } from '@/lib/api/admin/performance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function AdminEvaluationsPage() {
  const [search, setSearch] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'evaluations'],
    queryFn: () => listEvaluations(),
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data ?? []

    return (data ?? []).filter((evaluation) => {
      const intern = evaluation.user
      const evaluator = evaluation.evaluated_by
      const haystack = [
        intern?.name,
        intern?.email,
        evaluator?.name,
        evaluator?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [data, search])

  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Evaluations
          </h2>
          <p className="text-sm text-muted-foreground">
            Soft-skill assessments that feed quality and teamwork scores
          </p>
        </div>
        <Button
          render={<Link href="/admin/evaluations/new" />}
          className="gap-1"
        >
          <Plus className="size-4" />
          New evaluation
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by intern or evaluator…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : isError ? (
        <div className="rounded-xl bg-card p-8 text-center ring-1 ring-border/80">
          <p className="font-medium">Couldn&apos;t load evaluations</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (data ?? []).length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border/80">
          <p className="font-heading text-lg font-semibold">No evaluations yet</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border/80">
          <p className="font-heading text-lg font-semibold">No matches</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try another intern or evaluator name.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Intern</TableHead>
                <TableHead>Average</TableHead>
                <TableHead>Evaluator</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((evaluation) => (
                <TableRow key={evaluation.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Link
                      href={`/admin/evaluations/${evaluation.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {evaluation.user?.name ?? `Intern #${evaluation.id}`}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">
                    {Number(evaluation.average_score).toFixed(1)} / 5 (
                    {Number(evaluation.average_score_percentage).toFixed(0)}%)
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {evaluation.evaluated_by?.name ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(evaluation.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
