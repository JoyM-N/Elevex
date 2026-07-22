'use client'

import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PriorityBadge, StatusBadge } from '@/components/admin/projects/badges'
import type { Project } from '@/types'

export function ProjectTable({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border/80">
        <p className="font-heading text-lg font-semibold">No projects found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting filters or create a new project.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/80">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>End date</TableHead>
            <TableHead className="text-right">Deadline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="hover:bg-muted/40">
              <TableCell>
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {project.title}
                </Link>
              </TableCell>
              <TableCell>
                <StatusBadge status={project.status} label={project.status_label} />
              </TableCell>
              <TableCell>
                <PriorityBadge
                  priority={project.priority}
                  label={project.priority_label}
                />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {project.end_date}
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {project.days_until_deadline >= 0
                  ? `${project.days_until_deadline}d`
                  : `${Math.abs(project.days_until_deadline)}d overdue`}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
