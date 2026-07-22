'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  projectFormSchema,
  projectPriorityValues,
  projectStatusValues,
  type ProjectFormData,
} from '@/lib/validations/projects'
import { Loader2 } from 'lucide-react'

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

export function ProjectForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save project',
  isSubmitting,
}: {
  defaultValues?: Partial<ProjectFormData>
  onSubmit: (data: ProjectFormData) => void | Promise<void>
  submitLabel?: string
  isSubmitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      start_date: '',
      end_date: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title')} />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} {...register('description')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register('status')}
          >
            {projectStatusValues.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register('priority')}
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
          <Label htmlFor="start_date">Start date</Label>
          <Input id="start_date" type="date" {...register('start_date')} />
          {errors.start_date && (
            <p className="text-sm text-destructive">{errors.start_date.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End date</Label>
          <Input id="end_date" type="date" {...register('end_date')} />
          {errors.end_date && (
            <p className="text-sm text-destructive">{errors.end_date.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="gap-2">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        {submitLabel}
      </Button>
    </form>
  )
}
