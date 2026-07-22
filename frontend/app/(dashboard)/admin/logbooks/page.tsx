'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { listLogbookInterns } from '@/lib/api/admin/logbooks'
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

export default function AdminLogbooksPage() {
  const [page, setPage] = useState(1)

  const queryKey = useMemo(() => ['admin', 'logbooks', 'interns', page], [page])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => listLogbookInterns({ page, per_page: 20 }),
  })

  return (
    <div className="page-enter space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Logbooks
        </h2>
        <p className="text-sm text-muted-foreground">
          Browse interns, review their log entries, then finalize the logbook
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : isError ? (
        <div className="rounded-xl bg-card p-8 text-center ring-1 ring-border/80">
          <p className="font-medium">Couldn&apos;t load intern logbooks</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (data?.data ?? []).length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border/80">
          <p className="font-heading text-lg font-semibold">No logbooks yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Interns will appear here once they create entries.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Intern</TableHead>
                  <TableHead>Entries</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Logbook</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.data ?? []).map((intern) => (
                  <TableRow key={intern.id} className="hover:bg-muted/40">
                    <TableCell>
                      <Link
                        href={`/admin/logbooks/interns/${intern.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {intern.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {intern.email}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {intern.entries_count}
                    </TableCell>
                    <TableCell className="text-sm">
                      {intern.pending_count > 0 ? (
                        <span className="font-medium text-orange">
                          {intern.pending_count}
                        </span>
                      ) : (
                        intern.pending_count
                      )}
                      {intern.revision_count > 0 ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                          (+{intern.revision_count} revision)
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm">
                      {intern.approved_count}
                    </TableCell>
                    <TableCell className="text-sm">
                      {intern.total_hours}h
                    </TableCell>
                    <TableCell>
                      {intern.is_finalized ? (
                        <span className="text-xs font-medium text-primary">
                          Finalized
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          In progress
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data?.meta && data.meta.last_page > 1 ? (
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Page {data.meta.current_page} of {data.meta.last_page}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
