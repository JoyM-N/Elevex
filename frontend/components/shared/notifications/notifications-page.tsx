'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCheck, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/api/notifications'
import {
  formatNotificationRelative,
  notificationHref,
} from '@/lib/notifications/links'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types'

type Filter = 'all' | 'unread'

export function NotificationsPage() {
  const { user } = useAuth()
  const role = user?.role
  const router = useRouter()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<Filter>('all')

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['notifications', 'list', role, page],
    queryFn: () => listNotifications(role, page),
    enabled: !!role,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead(role, id),
    onSuccess: invalidate,
  })

  const markAll = useMutation({
    mutationFn: () => markAllNotificationsRead(role),
    onSuccess: invalidate,
  })

  const items = data?.data ?? []
  const visible =
    filter === 'unread' ? items.filter((n) => !n.read) : items
  const meta = data?.meta
  const unreadOnPage = items.filter((n) => !n.read).length

  function openNotification(notification: Notification) {
    if (!notification.read) {
      markRead.mutate(notification.id)
    }
    const href = notificationHref(notification, role)
    if (href) router.push(href)
  }

  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Notifications
          </h2>
          <p className="text-sm text-muted-foreground">
            Updates from tasks, logbooks, and reviews
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={markAll.isPending || unreadOnPage === 0}
          onClick={() => markAll.mutate()}
        >
          {markAll.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <CheckCheck className="size-3.5" />
          )}
          Mark all read
        </Button>
      </div>

      <div className="flex gap-1.5">
        {(
          [
            { value: 'all', label: 'All' },
            { value: 'unread', label: 'Unread' },
          ] as const
        ).map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={filter === option.value ? 'default' : 'outline'}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : isError ? (
        <div className="rounded-xl bg-card p-8 text-center ring-1 ring-border/80">
          <p className="font-medium">Couldn&apos;t load notifications</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border/80">
          <p className="font-heading text-lg font-semibold">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;ll see updates here when something needs your attention.
          </p>
        </div>
      ) : (
        <>
          <ul
            className={cn(
              'divide-y divide-border/80 overflow-hidden rounded-xl bg-card ring-1 ring-border/80',
              isFetching && 'opacity-80'
            )}
          >
            {visible.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => openNotification(n)}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40',
                    !n.read && 'bg-primary/5'
                  )}
                >
                  <span
                    className={cn(
                      'mt-2 size-2 shrink-0 rounded-full',
                      n.read ? 'bg-transparent' : 'bg-accent'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-foreground">
                      {n.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatNotificationRelative(n.created_at)}
                      {n.type ? ` · ${n.type.replaceAll('_', ' ')}` : ''}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {meta && meta.last_page > 1 ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {meta.current_page} of {meta.last_page}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.last_page}
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
