'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import {
  generateRecommendation,
  listRecommendations,
} from '@/lib/api/admin/recommendations'
import { listInterns } from '@/lib/api/admin/projects'
import { RecommendationStatusBadge } from '@/components/shared/recommendations/badges'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { RecommendationStatus } from '@/types'

const STATUS_FILTERS: Array<{ value: '' | RecommendationStatus; label: string }> =
  [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Drafts' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ]

export default function AdminRecommendationsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<'' | RecommendationStatus>('pending')
  const [search, setSearch] = useState('')
  const [internId, setInternId] = useState('')
  const [showGenerate, setShowGenerate] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'recommendations', { status }],
    queryFn: () => listRecommendations({ status: status || undefined }),
  })

  const internsQuery = useQuery({
    queryKey: ['admin', 'interns', { per_page: 100 }],
    queryFn: () => listInterns({ per_page: 100 }),
    enabled: showGenerate,
  })

  const generate = useMutation({
    mutationFn: () => generateRecommendation(Number(internId)),
    onSuccess: (letter) => {
      toast.success('Draft letter generated from performance data')
      queryClient.invalidateQueries({ queryKey: ['admin', 'recommendations'] })
      router.push(`/admin/recommendations/${letter.id}`)
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Could not generate letter'
      toast.error(msg)
    },
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data ?? []
    return (data ?? []).filter((letter) => {
      const haystack = [letter.user?.name, letter.user?.email]
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
            Recommendations
          </h2>
          <p className="text-sm text-muted-foreground">
            Generate drafts from performance, edit them, then approve as PDF
          </p>
        </div>
        <Button
          className="gap-1"
          onClick={() => setShowGenerate((v) => !v)}
        >
          <Plus className="size-4" />
          Generate for intern
        </Button>
      </div>

      {showGenerate ? (
        <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-border/80 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Label htmlFor="rec_intern">Intern</Label>
            <select
              id="rec_intern"
              className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
              value={internId}
              onChange={(e) => setInternId(e.target.value)}
            >
              <option value="">Select intern…</option>
              {(internsQuery.data?.data ?? []).map((intern) => (
                <option key={intern.id} value={intern.id}>
                  {intern.name}
                  {intern.active_internship
                    ? ` · ${intern.active_internship.department}`
                    : ''}
                </option>
              ))}
            </select>
          </div>
          <Button
            disabled={!internId || generate.isPending}
            onClick={() => generate.mutate()}
            className="gap-1"
          >
            {generate.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Generate draft
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by intern…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.label}
              size="sm"
              variant={status === filter.value ? 'default' : 'outline'}
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : isError ? (
        <div className="rounded-xl bg-card p-8 text-center ring-1 ring-border/80">
          <p className="font-medium">Couldn&apos;t load letters</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border/80">
          <p className="font-heading text-lg font-semibold">No letters yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate a draft for an intern, or wait for an intern request.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Intern</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((letter) => (
                <TableRow key={letter.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Link
                      href={`/admin/recommendations/${letter.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {letter.user?.name ?? `Letter #${letter.id}`}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {letter.user?.email}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {letter.internship?.department ?? '—'}
                  </TableCell>
                  <TableCell>
                    <RecommendationStatusBadge
                      status={letter.status}
                      label={letter.status_label}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(letter.created_at).toLocaleDateString()}
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
