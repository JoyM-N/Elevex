'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { getIntern } from '@/lib/api/admin/users'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminInternProfilePage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const { data: intern, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'interns', id],
    queryFn: () => getIntern(id),
    enabled: Number.isFinite(id),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !intern) {
    return (
      <div className="rounded-xl bg-card p-8 text-center ring-1 ring-border/80">
        <p className="font-medium">Couldn&apos;t load intern</p>
        <Button variant="outline" className="mt-3" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const active = intern.active_internship
  const history = intern.internships ?? []

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-6">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href="/admin/interns" />}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border">
              {intern.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={intern.avatar_url}
                  alt={intern.name}
                  className="size-full object-cover"
                />
              ) : (
                <span className="font-heading text-xl font-semibold text-muted-foreground">
                  {intern.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                {intern.name}
              </h2>
              <p className="text-sm text-muted-foreground">{intern.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              render={
                <Link href={`/admin/interns/${intern.id}/performance`} />
              }
            >
              Performance
            </Button>
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/admin/interns/${intern.id}/skills`} />}
            >
              Skills
            </Button>
            <Button
              variant="outline"
              size="sm"
              render={
                <Link href={`/admin/interns/${intern.id}/achievements`} />
              }
            >
              Achievements
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-card p-5 ring-1 ring-border/80">
          <h3 className="font-heading text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Contact
          </h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">{intern.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">
                {intern.is_active ? 'Active' : 'Inactive'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Joined</dt>
              <dd className="font-medium">
                {new Date(intern.created_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl bg-card p-5 ring-1 ring-border/80">
          <h3 className="font-heading text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Active internship
          </h3>
          {active ? (
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Department</dt>
                <dd className="font-medium">{active.department}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">University</dt>
                <dd className="font-medium">{active.university ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Student ID</dt>
                <dd className="font-medium">{active.student_id ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Period</dt>
                <dd className="font-medium">
                  {active.start_date} → {active.end_date}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Supervisor</dt>
                <dd className="font-medium">
                  {active.supervisor && 'name' in active.supervisor
                    ? active.supervisor.name
                    : '—'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No active internship on record.
            </p>
          )}
        </div>
      </div>

      {history.length > 0 ? (
        <div className="rounded-xl bg-card p-5 ring-1 ring-border/80">
          <h3 className="font-heading text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Internship history
          </h3>
          <ul className="mt-3 divide-y divide-border/80">
            {history.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-0.5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{item.department}</p>
                  <p className="text-muted-foreground">
                    {item.start_date} → {item.end_date}
                  </p>
                </div>
                <p className="capitalize text-muted-foreground">{item.status}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
