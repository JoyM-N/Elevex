'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Check, Loader2, RotateCcw } from 'lucide-react'
import {
  assignProjectMembers,
  createMilestone,
  deleteMilestone,
  removeProjectMember,
  updateMilestone,
  updateProject,
} from '@/lib/api/admin/projects'
import {
  projectPriorityValues,
  projectStatusValues,
  type ProjectFormData,
} from '@/lib/validations/projects'
import type { Project } from '@/types'
import {
  MembersPanel,
  membersFromProject,
  type DraftMember,
} from '@/components/admin/projects/members-panel'
import {
  MilestonesPanel,
  milestonesFromProject,
  type DraftMilestone,
} from '@/components/admin/projects/milestones-panel'
import { PriorityBadge, StatusBadge } from '@/components/admin/projects/badges'
import { DeleteProjectButton } from '@/components/admin/projects/delete-project-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<(typeof projectStatusValues)[number], string> = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const PRIORITY_LABELS: Record<(typeof projectPriorityValues)[number], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

type ProjectDraftFields = {
  title: string
  description: string
  status: ProjectFormData['status']
  priority: ProjectFormData['priority']
  start_date: string
  end_date: string
}

function fieldsFromProject(project: Project): ProjectDraftFields {
  return {
    title: project.title,
    description: project.description ?? '',
    status: project.status,
    priority: project.priority,
    start_date: project.start_date,
    end_date: project.end_date,
  }
}

function membersEqual(a: DraftMember[], b: DraftMember[]) {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort((x, y) => x.user_id - y.user_id)
  const sortedB = [...b].sort((x, y) => x.user_id - y.user_id)
  return sortedA.every(
    (m, i) =>
      m.user_id === sortedB[i].user_id && m.team_role === sortedB[i].team_role
  )
}

function milestonesEqual(a: DraftMilestone[], b: DraftMilestone[]) {
  if (a.length !== b.length) return false
  const mapB = new Map(b.map((m) => [m.key, m]))
  return a.every((m) => {
    const o = mapB.get(m.key)
    if (!o) return false
    return (
      m.id === o.id &&
      m.title === o.title &&
      (m.description ?? '') === (o.description ?? '') &&
      m.status === o.status &&
      m.start_date === o.start_date &&
      m.end_date === o.end_date
    )
  })
}

function fieldsEqual(a: ProjectDraftFields, b: ProjectDraftFields) {
  return (
    a.title === b.title &&
    a.description === b.description &&
    a.status === b.status &&
    a.priority === b.priority &&
    a.start_date === b.start_date &&
    a.end_date === b.end_date
  )
}

export function ProjectWorkspace({ project }: { project: Project }) {
  const queryClient = useQueryClient()
  const locked = project.is_locked

  const baselineFields = useMemo(() => fieldsFromProject(project), [project])
  const baselineMembers = useMemo(
    () => membersFromProject(project.members),
    [project]
  )
  const baselineMilestones = useMemo(
    () => milestonesFromProject(project.milestones),
    [project]
  )

  const [fields, setFields] = useState(baselineFields)
  const [members, setMembers] = useState(baselineMembers)
  const [milestones, setMilestones] = useState(baselineMilestones)

  useEffect(() => {
    setFields(baselineFields)
    setMembers(baselineMembers)
    setMilestones(baselineMilestones)
  }, [baselineFields, baselineMembers, baselineMilestones])

  const fieldsDirty = !fieldsEqual(fields, baselineFields)
  const membersDirty = !membersEqual(members, baselineMembers)
  const milestonesDirty = !milestonesEqual(milestones, baselineMilestones)
  const dirty = fieldsDirty || membersDirty || milestonesDirty

  function discard() {
    setFields(baselineFields)
    setMembers(baselineMembers)
    setMilestones(baselineMilestones)
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (fieldsDirty) {
        if (!fields.title.trim()) throw new Error('Title is required')
        if (fields.end_date <= fields.start_date) {
          throw new Error('End date must be after start date')
        }
        await updateProject(project.id, {
          title: fields.title.trim(),
          description: fields.description || null,
          status: fields.status,
          priority: fields.priority,
          start_date: fields.start_date,
          end_date: fields.end_date,
        })
      }

      if (membersDirty) {
        if (members.length > 0) {
          await assignProjectMembers(project.id, {
            members: members.map(({ user_id, team_role }) => ({
              user_id,
              team_role,
            })),
          })
        } else {
          const previousIds = baselineMembers.map((m) => m.user_id)
          for (const userId of previousIds) {
            await removeProjectMember(project.id, userId)
          }
        }
      }

      if (milestonesDirty) {
        const currentIds = new Set(
          milestones.filter((m) => m.id != null).map((m) => m.id as number)
        )
        const deletedIds = baselineMilestones
          .filter((m) => m.id != null && !currentIds.has(m.id))
          .map((m) => m.id as number)

        for (const milestoneId of deletedIds) {
          await deleteMilestone(project.id, milestoneId)
        }

        for (const m of milestones) {
          const payload = {
            title: m.title,
            description: m.description,
            status: m.status,
            start_date: m.start_date,
            end_date: m.end_date,
          }
          if (m.id == null) {
            await createMilestone(project.id, payload)
          } else {
            const original = baselineMilestones.find((b) => b.id === m.id)
            if (
              !original ||
              original.title !== m.title ||
              (original.description ?? '') !== (m.description ?? '') ||
              original.status !== m.status ||
              original.start_date !== m.start_date ||
              original.end_date !== m.end_date
            ) {
              await updateMilestone(project.id, m.id, payload)
            }
          }
        }
      }
    },
    onSuccess: () => {
      toast.success('Project saved')
      queryClient.invalidateQueries({
        queryKey: ['admin', 'projects', project.id],
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] })
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || 'Failed to save project'
      toast.error(msg)
    },
  })

  return (
    <div className="page-enter space-y-6 pb-24">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/admin/projects" />}
            className="mb-2 gap-1 px-0"
          >
            <ArrowLeft className="size-3.5" />
            Projects
          </Button>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {fields.title || project.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge
              status={fields.status}
              label={STATUS_LABELS[fields.status]}
            />
            <PriorityBadge
              priority={fields.priority}
              label={PRIORITY_LABELS[fields.priority]}
            />
            {locked ? (
              <span className="text-xs font-medium text-muted-foreground">
                Locked
              </span>
            ) : dirty ? (
              <span className="text-xs font-medium text-orange">
                Unsaved changes
              </span>
            ) : null}
          </div>
        </div>
        <DeleteProjectButton projectId={project.id} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl bg-card p-4 ring-1 ring-border/80">
            <h3 className="font-heading text-base font-semibold">Overview</h3>

            {locked ? (
              <>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {project.description || 'No description provided.'}
                </p>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Start</dt>
                    <dd className="font-medium">{project.start_date}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">End</dt>
                    <dd className="font-medium">{project.end_date}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Days until deadline</dt>
                    <dd className="font-medium">
                      {project.days_until_deadline}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Created by</dt>
                    <dd className="font-medium">
                      {project.created_by?.name ?? '—'}
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-title">Title</Label>
                  <Input
                    id="project-title"
                    value={fields.title}
                    onChange={(e) =>
                      setFields((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    rows={4}
                    value={fields.description}
                    onChange={(e) =>
                      setFields((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="project-status">Status</Label>
                    <select
                      id="project-status"
                      className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                      value={fields.status}
                      onChange={(e) =>
                        setFields((f) => ({
                          ...f,
                          status: e.target
                            .value as ProjectDraftFields['status'],
                        }))
                      }
                    >
                      {projectStatusValues.map((value) => (
                        <option key={value} value={value}>
                          {STATUS_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-priority">Priority</Label>
                    <select
                      id="project-priority"
                      className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                      value={fields.priority}
                      onChange={(e) =>
                        setFields((f) => ({
                          ...f,
                          priority: e.target
                            .value as ProjectDraftFields['priority'],
                        }))
                      }
                    >
                      {projectPriorityValues.map((value) => (
                        <option key={value} value={value}>
                          {PRIORITY_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="project-start">Start date</Label>
                    <Input
                      id="project-start"
                      type="date"
                      value={fields.start_date}
                      onChange={(e) =>
                        setFields((f) => ({
                          ...f,
                          start_date: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-end">End date</Label>
                    <Input
                      id="project-end"
                      type="date"
                      value={fields.end_date}
                      onChange={(e) =>
                        setFields((f) => ({
                          ...f,
                          end_date: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created by {project.created_by?.name ?? '—'} ·{' '}
                  {project.days_until_deadline} days until deadline
                </p>
              </div>
            )}
          </div>

          <MilestonesPanel
            milestones={milestones}
            locked={locked}
            onChange={setMilestones}
          />
        </div>

        <MembersPanel
          members={members}
          locked={locked}
          onChange={setMembers}
        />
      </div>

      {!locked ? (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-xl border border-border/80 bg-card/95 p-2 shadow-lg backdrop-blur-sm',
            dirty ? 'ring-1 ring-primary/20' : ''
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!dirty || saveMutation.isPending}
            onClick={discard}
            className="gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Discard
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!dirty || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            className="gap-1.5 min-w-32"
          >
            {saveMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            {dirty ? 'Save project' : 'Saved'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
