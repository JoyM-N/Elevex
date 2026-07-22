'use client'

import Link from 'next/link'
import { ChevronDown, KeyRound, LogOut, UserRound } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { userInitials } from '@/lib/auth/roles'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function UserMenu() {
  const { user, logout, isLoggingOut } = useAuth()
  const profileHref =
    user?.role === 'intern' ? '/intern/profile' : '/admin/profile'
  const passwordHref =
    user?.role === 'intern'
      ? '/intern/change-password'
      : '/admin/change-password'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-lg px-1.5 outline-none',
          'transition-colors hover:bg-secondary',
          'focus-visible:ring-2 focus-visible:ring-ring/50'
        )}
      >
        <Avatar size="sm" className="ring-2 ring-primary/10">
          {user?.avatar_url ? (
            <AvatarImage src={user.avatar_url} alt={user.name} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {userInitials(user)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-[140px] truncate text-left text-sm font-medium md:inline">
          {user?.name}
        </span>
        <ChevronDown className="hidden size-3.5 text-muted-foreground md:inline" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-56 w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {user?.name}
              </span>
              <span className="text-xs text-muted-foreground">{user?.email}</span>
              <span className="mt-1 w-fit rounded-md bg-accent/70 px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                {user?.role_label}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href={profileHref} />}>
            <UserRound />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={passwordHref} />}>
            <KeyRound />
            Change password
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            disabled={isLoggingOut}
            onClick={() => logout()}
          >
            <LogOut />
            {isLoggingOut ? 'Signing out…' : 'Sign out'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
