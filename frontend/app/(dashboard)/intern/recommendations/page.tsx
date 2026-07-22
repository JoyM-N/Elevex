'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Download, Loader2, ScrollText } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import {
  listMyRecommendations,
  requestRecommendation,
} from '@/lib/api/intern/recommendations'
import { RecommendationStatusBadge } from '@/components/shared/recommendations/badges'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function InternRecommendationsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const internshipId = user?.active_internship?.id

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['intern', 'recommendations'],
    queryFn: () => listMyRecommendations(),
  })

  const request = useMutation({
    mutationFn: () => {
      if (!internshipId) {
        throw new Error('No active internship')
      }
      return requestRecommendation(internshipId)
    },
    onSuccess: () => {
      toast.success('Recommendation letter requested')
      queryClient.invalidateQueries({ queryKey: ['intern', 'recommendations'] })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as Error)?.message ||
        'Request failed'
      toast.error(msg)
    },
  })

  const alreadyRequested = (data ?? []).length > 0

  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Recommendations
          </h2>
          <p className="text-sm text-muted-foreground">
            Request a letter based on your internship performance
          </p>
        </div>
        <Button
          className="gap-1"
          disabled={!internshipId || request.isPending || alreadyRequested}
          onClick={() => request.mutate()}
        >
          {request.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ScrollText className="size-4" />
          )}
          Request letter
        </Button>
      </div>

      {!internshipId ? (
        <div className="rounded-xl bg-card px-6 py-8 text-center ring-1 ring-border/80">
          <p className="font-medium">No active internship</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You need an active internship before requesting a letter.
          </p>
        </div>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : isError ? (
        <div className="rounded-xl bg-card p-8 text-center ring-1 ring-border/80">
          <p className="font-medium">Couldn&apos;t load requests</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (data ?? []).length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border/80">
          <p className="font-heading text-lg font-semibold">No requests yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit a request when you&apos;re ready for a recommendation letter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Letter</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((letter) => (
                <TableRow key={letter.id}>
                  <TableCell>
                    <RecommendationStatusBadge
                      status={letter.status}
                      label={letter.status_label}
                    />
                    {letter.admin_notes && letter.status === 'rejected' ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {letter.admin_notes}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {letter.internship?.department ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(letter.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {letter.status === 'approved' && letter.pdf_url ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        render={
                          <a
                            href={letter.pdf_url}
                            target="_blank"
                            rel="noreferrer"
                          />
                        }
                      >
                        <Download className="size-3.5" />
                        Download
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
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
