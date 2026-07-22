'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  TaskPriorityBadge,
  TaskStatusBadge,
} from '@/components/admin/tasks/badges'
import type { Task } from '@/types'
import { cn } from '@/lib/utils'

function sortProjectTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const projectA = a.milestone?.project?.title ?? ''
    const projectB = b.milestone?.project?.title ?? ''
    if (projectA !== projectB) return projectA.localeCompare(projectB)

    const milestoneA = a.milestone?.title ?? ''
    const milestoneB = b.milestone?.title ?? ''
    if (milestoneA !== milestoneB) return milestoneA.localeCompare(milestoneB)

    return a.title.localeCompare(b.title)
  })
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-card px-6 py-12 text-center ring-1 ring-border/80">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export function TaskList({
  tasks,
  hrefBase = '/admin/tasks',
  showAssignee = true,
  mode = 'all',
}: {
  tasks: Task[]
  hrefBase?: string
  showAssignee?: boolean
  mode?: 'all' | 'project' | 'general'
}) {
  const projectTasks = useMemo(
    () => sortProjectTasks(tasks.filter((t) => t.task_type === 'project_task')),
    [tasks]
  )
  const generalTasks = useMemo(
    () => tasks.filter((t) => t.task_type === 'general_task'),
    [tasks]
  )

  const showProject = mode === 'all' || mode === 'project'
  const showGeneral = mode === 'all' || mode === 'general'

  if (
    (showProject ? projectTasks.length === 0 : true) &&
    (showGeneral ? generalTasks.length === 0 : true)
  ) {
    return (
      <EmptyState
        message={
          mode === 'project'
            ? 'No project tasks found.'
            : mode === 'general'
              ? 'No general tasks found.'
              : 'No tasks found. Try adjusting filters or create a new task.'
        }
      />
    )
  }

  return (
    <div className="space-y-8">
      {showProject && (mode === 'project' || projectTasks.length > 0) ? (
        <section className="space-y-3">
          {mode === 'all' ? (
            <div>
              <h3 className="font-heading text-lg font-semibold">
                Project tasks
              </h3>
            </div>
          ) : null}

          {projectTasks.length === 0 ? (
            <EmptyState message="No project tasks found." />
          ) : (
            <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Milestone</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    {showAssignee ? <TableHead>Assignee</TableHead> : null}
                    <TableHead className="text-right">Deadline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-muted/40">
                      <TableCell className="max-w-[10rem] truncate text-sm text-muted-foreground">
                        {task.milestone?.project?.title ?? '—'}
                      </TableCell>
                      <TableCell className="max-w-[10rem] truncate text-sm text-muted-foreground">
                        {task.milestone?.title ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`${hrefBase}/${task.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {task.title}
                        </Link>
                        {task.is_overdue ? (
                          <span className="ml-2 text-xs font-medium text-orange">
                            Overdue
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <TaskStatusBadge
                          status={task.status}
                          label={task.status_label}
                        />
                      </TableCell>
                      <TableCell>
                        <TaskPriorityBadge
                          priority={task.priority}
                          label={task.priority_label}
                        />
                      </TableCell>
                      {showAssignee ? (
                        <TableCell className="text-sm text-muted-foreground">
                          {task.assigned_to?.name ?? '—'}
                        </TableCell>
                      ) : null}
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {task.deadline ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      ) : null}

      {showGeneral && (mode === 'general' || generalTasks.length > 0) ? (
        <section className="space-y-3">
          {mode === 'all' ? (
            <div>
              <h3 className="font-heading text-lg font-semibold">
                General tasks
              </h3>
            </div>
          ) : null}

          {generalTasks.length === 0 ? (
            <EmptyState message="No general tasks found." />
          ) : (
            <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    {showAssignee ? <TableHead>Assignee</TableHead> : null}
                    <TableHead className="text-right">Deadline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generalTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-muted/40">
                      <TableCell>
                        <Link
                          href={`${hrefBase}/${task.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {task.title}
                        </Link>
                        {task.is_overdue ? (
                          <span className="ml-2 text-xs font-medium text-orange">
                            Overdue
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <TaskStatusBadge
                          status={task.status}
                          label={task.status_label}
                        />
                      </TableCell>
                      <TableCell>
                        <TaskPriorityBadge
                          priority={task.priority}
                          label={task.priority_label}
                        />
                      </TableCell>
                      {showAssignee ? (
                        <TableCell className="text-sm text-muted-foreground">
                          {task.assigned_to?.name ?? '—'}
                        </TableCell>
                      ) : null}
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {task.deadline ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}

export function TaskTypeTabs({
  value,
  onChange,
  projectCount,
  generalCount,
}: {
  value: 'project' | 'general'
  onChange: (next: 'project' | 'general') => void
  projectCount?: number
  generalCount?: number
}) {
  const tabs = [
    { id: 'project' as const, label: 'Project tasks', count: projectCount },
    { id: 'general' as const, label: 'General tasks', count: generalCount },
  ]

  return (
    <div className="flex w-fit gap-1 rounded-lg bg-muted/60 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === tab.id
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
          {typeof tab.count === 'number' ? (
            <span className="ml-1.5 text-xs text-muted-foreground">
              {tab.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  )
}
