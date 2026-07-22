'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { getNavForRole } from '@/components/layout/nav-config'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

function NavGroup({
  label,
  items,
  pathname,
}: {
  label?: string
  items: ReturnType<typeof getNavForRole>['main']
  pathname: string
}) {
  return (
    <SidebarGroup>
      {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/admin/dashboard' &&
                item.href !== '/intern/dashboard' &&
                pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={item.title}
                  render={<Link href={item.href} />}
                  className={cn(
                    'relative transition-all duration-200',
                    active &&
                      'before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-sidebar-primary'
                  )}
                >
                  <Icon
                    className={cn(
                      'transition-colors',
                      active ? 'text-sidebar-primary' : 'text-muted-foreground'
                    )}
                  />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { user, isSuperAdmin, logout, isLoggingOut } = useAuth()
  const { main, extras, extrasLabel } = getNavForRole(user?.role)

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <Link
          href={
            user?.role === 'intern' ? '/intern/dashboard' : '/admin/dashboard'
          }
          className="flex items-center gap-2.5 px-1 transition-opacity hover:opacity-80"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm shadow-primary/25">
            E
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-heading text-base font-semibold tracking-tight text-primary">
              Elevex
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              Internship OS
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1 py-2">
        <NavGroup items={main} pathname={pathname} />
        {extras.length > 0 ? (
          <NavGroup
            label={extrasLabel}
            items={extras}
            pathname={pathname}
          />
        ) : null}
      </SidebarContent>

      <SidebarFooter className="gap-2 border-t border-sidebar-border p-2">
        {isSuperAdmin ? (
          <>
            <div className="rounded-md bg-accent/60 px-2.5 py-1.5 text-center text-[11px] font-medium text-accent-foreground group-data-[collapsible=icon]:hidden">
              Super Admin
            </div>
            <div
              className="mx-auto hidden size-2 rounded-full bg-accent group-data-[collapsible=icon]:block"
              title="Super Admin"
            />
            <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />
          </>
        ) : null}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              disabled={isLoggingOut}
              onClick={() => logout()}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut />
              <span>{isLoggingOut ? 'Signing out…' : 'Sign out'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
