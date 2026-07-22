import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  BookOpen,
  Users,
  ClipboardCheck,
  FileBarChart,
  FileText,
  Settings,
  Shield,
  Trophy,
  ScrollText,
} from 'lucide-react'
import type { UserRole } from '@/types'

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  /** If set, only these roles see the item */
  roles?: UserRole[]
}

/** Shared by admin + super_admin */
export const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Projects', href: '/admin/projects', icon: FolderKanban },
  { title: 'Tasks', href: '/admin/tasks', icon: ListTodo },
  { title: 'Logbooks', href: '/admin/logbooks', icon: BookOpen },
  { title: 'Interns', href: '/admin/interns', icon: Users },
  { title: 'Evaluations', href: '/admin/evaluations', icon: ClipboardCheck },
  { title: 'Reports', href: '/admin/reports', icon: FileBarChart },
  { title: 'Recommendations', href: '/admin/recommendations', icon: FileText },
  { title: 'Settings', href: '/admin/settings', icon: Settings },
]

/** Super-admin only — admin account management */
export const superAdminNavItems: NavItem[] = [
  {
    title: 'Admins',
    href: '/admin/admins',
    icon: Shield,
    roles: ['super_admin'],
  },
]

export const internNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/intern/dashboard', icon: LayoutDashboard },
  { title: 'Projects', href: '/intern/projects', icon: FolderKanban },
  { title: 'Tasks', href: '/intern/tasks', icon: ListTodo },
  { title: 'Logbooks', href: '/intern/logbooks', icon: BookOpen },
  { title: 'Performance', href: '/intern/performance', icon: Trophy },
  { title: 'Recommendations', href: '/intern/recommendations', icon: ScrollText },
]

export function getNavForRole(role: UserRole | undefined): {
  main: NavItem[]
  extras: NavItem[]
  extrasLabel?: string
} {
  if (role === 'intern') {
    return { main: internNavItems, extras: [] }
  }

  if (role === 'super_admin') {
    return {
      main: adminNavItems,
      extras: superAdminNavItems,
      extrasLabel: 'Administration',
    }
  }

  // admin (and fallback)
  return { main: adminNavItems, extras: [] }
}

export function pageTitleFromPath(pathname: string): string {
  const all = [...adminNavItems, ...superAdminNavItems, ...internNavItems]
  const exact = all.find((item) => item.href === pathname)
  if (exact) return exact.title

  const partial = all.find(
    (item) => item.href !== '/' && pathname.startsWith(item.href)
  )
  return partial?.title ?? 'Elevex'
}
