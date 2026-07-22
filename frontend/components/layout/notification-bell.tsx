'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/api/notifications'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types'

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationBell() {
  const { user } = useAuth()
  const role = user?.role
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count', role],
    queryFn: () => getUnreadCount(role),
    enabled: !!role,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })

  const { data: list, isLoading } = useQuery({
    queryKey: ['notifications', 'list', role],
    queryFn: () => listNotifications(role, 1),
    enabled: !!role && open,
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

  const notifications: Notification[] = list?.data ?? []

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          'relative inline-flex size-9 items-center justify-center rounded-lg outline-none',
          'transition-colors hover:bg-secondary',
          'focus-visible:ring-2 focus-visible:ring-ring/50'
        )}
        aria-label="Notifications"
      >
        <Bell className="size-4 text-muted-foreground" />
        {unreadCount > 0 ? (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground shadow-sm ring-2 ring-background">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator className="m-0" />

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  'cursor-pointer items-start gap-2 rounded-none px-3 py-2.5',
                  !n.read && 'bg-primary/5'
                )}
                onClick={() => {
                  if (!n.read) markRead.mutate(n.id)
                }}
              >
                <span
                  className={cn(
                    'mt-1.5 size-1.5 shrink-0 rounded-full',
                    n.read ? 'bg-transparent' : 'bg-accent'
                  )}
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm leading-snug text-foreground">
                    {n.message}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatRelative(n.created_at)}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
