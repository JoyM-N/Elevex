'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { listInterns } from '@/lib/api/admin/projects'
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

export default function AdminInternsPage() {
  const [search, setSearch] = useState('')

  const queryKey = useMemo(
    () => ['admin', 'interns', { search, per_page: 100 }],
    [search]
  )

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      listInterns({
        search: search || undefined,
        per_page: 100,
      }),
  })

  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Interns
          </h2>
        <p className="text-sm text-muted-foreground">
          Profiles, onboarding, performance, and skills. Department comes from
          each intern&apos;s active internship.
        </p>
        </div>
        <Button
          render={<Link href="/admin/interns/new" />}
          className="gap-1"
        >
          <Plus className="size-4" />
          Onboard intern
        </Button>
      </div>

      <Input
        placeholder="Search interns…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : isError ? (
        <div className="rounded-xl bg-card p-8 text-center ring-1 ring-border/80">
          <p className="font-medium">Couldn&apos;t load interns</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (data?.data ?? []).length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border/80">
          <p className="font-heading text-lg font-semibold">No interns yet</p>
          <Button
            className="mt-4"
            render={<Link href="/admin/interns/new" />}
          >
            Onboard the first intern
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Internship</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).map((intern) => (
                <TableRow key={intern.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Link
                      href={`/admin/interns/${intern.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {intern.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {intern.email}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {intern.active_internship
                      ? `${intern.active_internship.department} · ${intern.active_internship.status}`
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        render={
                          <Link href={`/admin/interns/${intern.id}`} />
                        }
                      >
                        Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        render={
                          <Link href={`/admin/interns/${intern.id}/edit`} />
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        render={
                          <Link
                            href={`/admin/interns/${intern.id}/performance`}
                          />
                        }
                      >
                        Performance
                      </Button>
                    </div>
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
