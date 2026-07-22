'use client'

import { Input } from '@/components/ui/input'
import {
  projectPriorityValues,
  projectStatusValues,
} from '@/lib/validations/projects'
import type { ProjectPriority, ProjectStatus } from '@/types'

export type ProjectFiltersState = {
  search: string
  status: ProjectStatus | ''
  priority: ProjectPriority | ''
}

export function ProjectFilters({
  value,
  onChange,
}: {
  value: ProjectFiltersState
  onChange: (next: ProjectFiltersState) => void
}) {
  const selectClass =
    'flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-40'

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        placeholder="Search projects…"
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
        className="sm:max-w-xs"
      />
      <select
        className={selectClass}
        value={value.status}
        onChange={(e) =>
          onChange({
            ...value,
            status: e.target.value as ProjectStatus | '',
          })
        }
      >
        <option value="">All statuses</option>
        {projectStatusValues.map((s) => (
          <option key={s} value={s}>
            {s.replaceAll('_', ' ')}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        value={value.priority}
        onChange={(e) =>
          onChange({
            ...value,
            priority: e.target.value as ProjectPriority | '',
          })
        }
      >
        <option value="">All priorities</option>
        {projectPriorityValues.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  )
}
