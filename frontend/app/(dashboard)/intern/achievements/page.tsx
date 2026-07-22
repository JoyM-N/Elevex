'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Trophy } from 'lucide-react'
import { getMyAchievements } from '@/lib/api/intern/performance'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function InternAchievementsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['intern', 'achievements'],
    queryFn: getMyAchievements,
  })

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />

  return (
    <div className="page-enter space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/intern/performance" />}
          className="mb-2 gap-1 px-0"
        >
          <ArrowLeft className="size-3.5" />
          Performance
        </Button>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Achievements
        </h2>
      </div>

      {isError ? (
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      ) : (data ?? []).length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border/80">
          <Trophy className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No achievements yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep shipping work — badges unlock as you hit milestones.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((a) => (
            <li
              key={a.id}
              className="rounded-xl bg-card p-4 ring-1 ring-border/80"
            >
              <p className="font-heading font-semibold">{a.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {a.description}
              </p>
              {a.awarded_at ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Awarded {new Date(String(a.awarded_at)).toLocaleDateString()}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
