'use client'

import { Input } from '@/components/ui/input'
import {
  taskPriorityValues,
  taskStatusValues,
  taskTypeValues,
} from '@/lib/validations/tasks'
import type { TaskPriority, TaskStatus, TaskType } from '@/types'

export type TaskFiltersState = {
  search: string
  status: TaskStatus | ''
  priority: TaskPriority | ''
  task_type: TaskType | ''
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  in_review: 'In review',
  completed: 'Completed',
  blocked: 'Blocked',
  cancelled: 'Cancelled',
}

export function TaskFilters({
  value,
  onChange,
  showSearch = true,
  showTypeFilter = false,
}: {
  value: TaskFiltersState
  onChange: (next: TaskFiltersState) => void
  showSearch?: boolean
  showTypeFilter?: boolean
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      {showSearch ? (
        <Input
          placeholder="Search tasks…"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          className="sm:max-w-xs"
        />
      ) : null}
      <select
        className="flex h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        value={value.status}
        onChange={(e) =>
          onChange({
            ...value,
            status: e.target.value as TaskStatus | '',
          })
        }
      >
        <option value="">All statuses</option>
        {taskStatusValues.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <select
        className="flex h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        value={value.priority}
        onChange={(e) =>
          onChange({
            ...value,
            priority: e.target.value as TaskPriority | '',
          })
        }
      >
        <option value="">All priorities</option>
        {taskPriorityValues.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      {showTypeFilter ? (
        <select
          className="flex h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={value.task_type}
          onChange={(e) =>
            onChange({
              ...value,
              task_type: e.target.value as TaskType | '',
            })
          }
        >
          <option value="">All types</option>
          {taskTypeValues.map((t) => (
            <option key={t} value={t}>
              {t.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  )
}
