'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { listInterns } from '@/lib/api/admin/projects'
import { teamRoleValues } from '@/lib/validations/projects'
import type { ProjectMember, User } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export type DraftMember = {
  user_id: number
  team_role: (typeof teamRoleValues)[number]
  name?: string
  email?: string
}

function humanize(role: string) {
  return role.split('_').map((p) => p[0].toUpperCase() + p.slice(1)).join(' ')
}

export function membersFromProject(
  members: ProjectMember[] | undefined
): DraftMember[] {
  return (members ?? []).map((m) => ({
    user_id: m.id,
    team_role: (m.team_role as DraftMember['team_role']) || 'solo',
    name: m.name,
    email: m.email,
  }))
}

function MemberPickerDialog({
  mode,
  members,
  onApply,
  trigger,
}: {
  mode: 'add' | 'manage'
  members: DraftMember[]
  onApply: (next: DraftMember[]) => void
  trigger: React.ReactElement
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DraftMember[]>(members)

  const { data: internsData, isLoading } = useQuery({
    queryKey: ['admin', 'interns'],
    queryFn: () => listInterns({ per_page: 100 }),
    enabled: open,
  })

  const internOptions = useMemo(() => internsData?.data ?? [], [internsData])
  const baselineIds = useMemo(
    () => new Set(members.map((m) => m.user_id)),
    [members]
  )

  const selectedIds = new Set(draft.map((d) => d.user_id))
  const visibleRows =
    mode === 'add' ? draft.filter((d) => !baselineIds.has(d.user_id)) : draft
  const canApply =
    mode === 'add'
      ? draft.some((d) => !baselineIds.has(d.user_id))
      : true

  function resolveName(row: DraftMember, options: User[]) {
    return (
      row.name ||
      options.find((i) => i.id === row.user_id)?.name ||
      members.find((m) => m.user_id === row.user_id)?.name ||
      `User #${row.user_id}`
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(members)
        setOpen(next)
      }}
    >
      {trigger}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add members' : 'Manage members'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Select interns to add. Click Done, then Save project to persist.'
              : 'Update roles or remove members. Click Done, then Save project to persist.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {mode === 'add' ? (
              <div className="space-y-2">
                <Label>Add intern</Label>
                <select
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  defaultValue=""
                  onChange={(e) => {
                    const id = Number(e.target.value)
                    if (!id || selectedIds.has(id)) return
                    const intern = internOptions.find((i) => i.id === id)
                    setDraft((prev) => [
                      ...prev,
                      {
                        user_id: id,
                        team_role: 'solo',
                        name: intern?.name,
                        email: intern?.email,
                      },
                    ])
                    e.target.value = ''
                  }}
                >
                  <option value="">Select an intern…</option>
                  {internOptions
                    .filter((i) => !selectedIds.has(i.id))
                    .map((intern) => (
                      <option key={intern.id} value={intern.id}>
                        {intern.name} ({intern.email})
                      </option>
                    ))}
                </select>
              </div>
            ) : null}

            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {visibleRows.length === 0 ? (
                <li className="py-6 text-center text-sm text-muted-foreground">
                  {mode === 'add'
                    ? 'Pick an intern above to add them.'
                    : 'No members on this project'}
                </li>
              ) : (
                visibleRows.map((row) => (
                  <li
                    key={row.user_id}
                    className="flex items-center gap-2 rounded-lg border border-border/80 p-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {resolveName(row, internOptions)}
                      </p>
                    </div>
                    <select
                      className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                      value={row.team_role}
                      onChange={(e) =>
                        setDraft((prev) =>
                          prev.map((d) =>
                            d.user_id === row.user_id
                              ? {
                                  ...d,
                                  team_role: e.target
                                    .value as DraftMember['team_role'],
                                }
                              : d
                          )
                        )
                      }
                    >
                      {teamRoleValues.map((role) => (
                        <option key={role} value={role}>
                          {humanize(role)}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setDraft((prev) =>
                          prev.filter((d) => d.user_id !== row.user_id)
                        )
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </li>
                ))
              )}
            </ul>

            <Button
              className="w-full"
              disabled={!canApply}
              onClick={() => {
                onApply(draft)
                setOpen(false)
              }}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function MembersPanel({
  members,
  locked,
  onChange,
}: {
  members: DraftMember[]
  locked?: boolean
  onChange: (next: DraftMember[]) => void
}) {
  return (
    <div className="h-fit rounded-xl bg-card p-4 ring-1 ring-border/80">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-base font-semibold">Members</h3>
          <p className="text-xs text-muted-foreground">
            {members.length} assigned
          </p>
        </div>
        {!locked ? (
          <div className="flex shrink-0 gap-1">
            <MemberPickerDialog
              mode="add"
              members={members}
              onApply={onChange}
              trigger={
                <DialogTrigger render={<Button size="sm" className="gap-1" />}>
                  <Plus className="size-3.5" />
                  Add
                </DialogTrigger>
              }
            />
            {members.length > 0 ? (
              <MemberPickerDialog
                mode="manage"
                members={members}
                onApply={onChange}
                trigger={
                  <DialogTrigger
                    render={
                      <Button variant="outline" size="sm" className="gap-1" />
                    }
                  >
                    <Pencil className="size-3.5" />
                    Manage
                  </DialogTrigger>
                }
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {members.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No members yet
        </p>
      ) : (
        <ul className="divide-y divide-border/70">
          {members.map((member) => (
            <li key={member.user_id} className="py-2.5">
              <p className="text-sm font-medium">
                {member.name ?? `User #${member.user_id}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {member.team_role.replaceAll('_', ' ')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
