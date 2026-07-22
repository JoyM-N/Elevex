'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  milestoneFormSchema,
  milestoneStatusValues,
  type MilestoneFormData,
} from '@/lib/validations/projects'
import type { Milestone, MilestoneStatus } from '@/types'
import { StatusBadge } from '@/components/admin/projects/badges'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type DraftMilestone = {
  key: string
  id?: number
  title: string
  description: string | null
  status: MilestoneStatus
  start_date: string
  end_date: string
}

export function milestonesFromProject(
  milestones: Milestone[] | undefined
): DraftMilestone[] {
  return (milestones ?? []).map((m) => ({
    key: `m-${m.id}`,
    id: m.id,
    title: m.title,
    description: m.description,
    status: m.status,
    start_date: m.start_date,
    end_date: m.end_date,
  }))
}

function MilestoneFormFields({
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  defaultValues?: Partial<MilestoneFormData>
  onSubmit: (data: MilestoneFormData) => void
  submitLabel: string
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
      start_date: '',
      end_date: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="ms-title">Title</Label>
        <Input id="ms-title" {...register('title')} />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="ms-description">Description</Label>
        <Textarea id="ms-description" rows={3} {...register('description')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ms-status">Status</Label>
        <select
          id="ms-status"
          className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          {...register('status')}
        >
          {milestoneStatusValues.map((s) => (
            <option key={s} value={s}>
              {s.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ms-start">Start</Label>
          <Input id="ms-start" type="date" {...register('start_date')} />
          {errors.start_date && (
            <p className="text-sm text-destructive">{errors.start_date.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="ms-end">End</Label>
          <Input id="ms-end" type="date" {...register('end_date')} />
          {errors.end_date && (
            <p className="text-sm text-destructive">{errors.end_date.message}</p>
          )}
        </div>
      </div>
      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  )
}

export function MilestonesPanel({
  milestones,
  locked,
  onChange,
}: {
  milestones: DraftMilestone[]
  locked?: boolean
  onChange: (next: DraftMilestone[]) => void
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<DraftMilestone | null>(null)

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-border/80">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-heading text-base font-semibold">Milestones</h3>
          <p className="text-xs text-muted-foreground">
            {milestones.length} total
          </p>
        </div>
        {!locked ? (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button size="sm" className="gap-1" />}>
              <Plus className="size-3.5" />
              Add
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New milestone</DialogTitle>
                <DialogDescription>
                  Added to this draft. Use Save project to persist.
                </DialogDescription>
              </DialogHeader>
              <MilestoneFormFields
                submitLabel="Add to draft"
                onSubmit={(data) => {
                  onChange([
                    ...milestones,
                    {
                      key: `new-${crypto.randomUUID()}`,
                      title: data.title,
                      description: data.description ?? null,
                      status: (data.status ?? 'pending') as MilestoneStatus,
                      start_date: data.start_date,
                      end_date: data.end_date,
                    },
                  ])
                  setCreateOpen(false)
                }}
              />
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      {milestones.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No milestones yet
        </p>
      ) : (
        <ul className="divide-y divide-border/70">
          {milestones.map((m) => (
            <li
              key={m.key}
              className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-foreground">
                  {m.title}
                  {!m.id ? (
                    <span className="ml-2 text-xs font-normal text-orange">
                      New
                    </span>
                  ) : null}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={m.status} />
                  <span className="text-xs text-muted-foreground">
                    {m.start_date} → {m.end_date}
                  </span>
                </div>
              </div>
              {!locked ? (
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setEditing(m)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      if (confirm('Remove this milestone from the draft?')) {
                        onChange(milestones.filter((x) => x.key !== m.key))
                      }
                    }}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit milestone</DialogTitle>
            <DialogDescription>
              Updates this draft. Use Save project to persist.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <MilestoneFormFields
              key={editing.key}
              defaultValues={{
                title: editing.title,
                description: editing.description ?? '',
                status: editing.status,
                start_date: editing.start_date,
                end_date: editing.end_date,
              }}
              submitLabel="Apply to draft"
              onSubmit={(data) => {
                onChange(
                  milestones.map((m) =>
                    m.key === editing.key
                      ? {
                          ...m,
                          title: data.title,
                          description: data.description ?? null,
                          status: (data.status ??
                            m.status) as MilestoneStatus,
                          start_date: data.start_date,
                          end_date: data.end_date,
                        }
                      : m
                  )
                )
                setEditing(null)
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
