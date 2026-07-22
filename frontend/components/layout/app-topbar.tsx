'use client'

import { usePathname } from 'next/navigation'
import { pageTitleFromPath } from '@/components/layout/nav-config'
import { NotificationBell } from '@/components/layout/notification-bell'
import { UserMenu } from '@/components/layout/user-menu'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function AppTopbar() {
  const pathname = usePathname()
  const title = pageTitleFromPath(pathname)

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/80 bg-card/80 px-4 backdrop-blur-md transition-shadow supports-[backdrop-filter]:bg-card/70">
      <SidebarTrigger className="-ml-1 transition-colors hover:bg-secondary" />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <h1 className="font-heading truncate text-base font-semibold tracking-tight text-foreground">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-1.5">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}
