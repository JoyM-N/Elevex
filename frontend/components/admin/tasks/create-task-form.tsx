'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { listInterns, listMilestones, listProjects } from '@/lib/api/admin/projects'
import {
  createTaskSchema,
  taskPriorityValues,
  taskTypeValues,
  type CreateTaskFormData,
} from '@/lib/validations/tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const TYPE_LABELS: Record<(typeof taskTypeValues)[number], string> = {
  project_task: 'Project task',
  general_task: 'General task',
}

const PRIORITY_LABELS: Record<(typeof taskPriorityValues)[number], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export function CreateTaskForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: CreateTaskFormData) => void | Promise<void>
  isSubmitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      task_type: 'general_task',
      priority: 'medium',
      assigned_to: undefined,
      estimated_hours: undefined,
      deadline: '',
      milestone_id: undefined,
      project_id: undefined,
    },
  })

  const taskType = useWatch({ control, name: 'task_type' })
  const projectId = useWatch({ control, name: 'project_id' })

  const { data: internsData } = useQuery({
    queryKey: ['admin', 'interns'],
    queryFn: () => listInterns({ per_page: 100 }),
  })

  const { data: projectsData } = useQuery({
    queryKey: ['admin', 'projects', { per_page: 100 }],
    queryFn: () => listProjects({ per_page: 100 }),
    enabled: taskType === 'project_task',
  })

  const { data: milestones, isFetching: loadingMilestones } = useQuery({
    queryKey: ['admin', 'projects', projectId, 'milestones'],
    queryFn: () => listMilestones(Number(projectId)),
    enabled: taskType === 'project_task' && !!projectId,
  })

  useEffect(() => {
    if (taskType === 'general_task') {
      setValue('milestone_id', null)
      setValue('project_id', null)
    }
  }, [taskType, setValue])

  useEffect(() => {
    setValue('milestone_id', null)
  }, [projectId, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
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
          <Label htmlFor="task_type">Type</Label>
          <select
            id="task_type"
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            {...register('task_type')}
          >
            {taskTypeValues.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            {...register('priority')}
          >
            {taskPriorityValues.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {taskType === 'project_task' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="project_id">Project</Label>
            <select
              id="project_id"
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              {...register('project_id', { valueAsNumber: true })}
            >
              <option value="">Select project…</option>
              {(projectsData?.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="milestone_id">Milestone</Label>
            <select
              id="milestone_id"
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              disabled={!projectId || loadingMilestones}
              {...register('milestone_id', { valueAsNumber: true })}
            >
              <option value="">
                {loadingMilestones ? 'Loading…' : 'Select milestone…'}
              </option>
              {(milestones ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
            {errors.milestone_id && (
              <p className="text-sm text-destructive">
                {errors.milestone_id.message}
              </p>
            )}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="assigned_to">Assign to</Label>
        <select
          id="assigned_to"
          className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          {...register('assigned_to', { valueAsNumber: true })}
        >
          <option value="">Select intern…</option>
          {(internsData?.data ?? []).map((intern) => (
            <option key={intern.id} value={intern.id}>
              {intern.name} ({intern.email})
            </option>
          ))}
        </select>
        {errors.assigned_to && (
          <p className="text-sm text-destructive">
            {errors.assigned_to.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="estimated_hours">Estimated hours</Label>
          <Input
            id="estimated_hours"
            type="number"
            step="0.5"
            min="0.5"
            {...register('estimated_hours', {
              setValueAs: (v) =>
                v === '' || v == null ? null : Number(v),
            })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input id="deadline" type="date" {...register('deadline')} />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="gap-2">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Create task
      </Button>
    </form>
  )
}
