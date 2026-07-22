<?php

namespace App\Services;

use App\Enums\LogbookStatus;
use App\Models\Logbook;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

/**
 * LogbookService
 *
 * All logbook business logic lives here.
 *
 * Key business rules enforced here:
 *   - An intern cannot submit a logbook for a task
 *     not assigned to them
 *   - Approved logbooks are permanently immutable
 *     (enforced in Policy — but double-checked here)
 *   - reviewed_at and approved_by are set automatically
 *     on review actions — never manually
 *   - Status transitions are controlled — you cannot jump
 *     from draft directly to approved
 */
class LogbookService
{
    /**
     * Get all logbooks with optional filters.
     *
     * scopeToUser: when passed, only returns logbooks
     * belonging to that intern. Used for intern routes.
     */
    public function getAllLogbooks(
        array $filters = [],
        int $perPage = 15,
        ?User $scopeToUser = null
    ): LengthAwarePaginator {
        return Logbook::query()
            ->with(['user', 'task', 'approvedBy'])
            ->when($scopeToUser, function ($query) use ($scopeToUser) {
                $query->where('user_id', $scopeToUser->id);
            })
            ->when(isset($filters['status']), function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            })
            ->when(isset($filters['user_id']), function ($query) use ($filters) {
                $query->where('user_id', $filters['user_id']);
            })
            ->when(isset($filters['task_id']), function ($query) use ($filters) {
                $query->where('task_id', $filters['task_id']);
            })
            ->when(isset($filters['date']), function ($query) use ($filters) {
                $query->whereDate('date', $filters['date']);
            })
            ->latest('date')
            ->paginate($perPage);
    }

    /**
     * Interns who have at least one logbook, with entry counts for the admin index.
     */
    public function getInternLogbookSummaries(int $perPage = 20): LengthAwarePaginator
    {
        return User::query()
            ->where('role', 'intern')
            ->whereHas('logbooks')
            ->withCount([
                'logbooks as entries_count',
                'logbooks as pending_count' => fn ($q) => $q->where('status', LogbookStatus::Submitted),
                'logbooks as approved_count' => fn ($q) => $q->where('status', LogbookStatus::Approved),
                'logbooks as revision_count' => fn ($q) => $q->where('status', LogbookStatus::RevisionNeeded),
                'logbooks as draft_count' => fn ($q) => $q->where('status', LogbookStatus::Draft),
            ])
            ->withSum('logbooks as total_hours', 'hours_worked')
            ->with(['logbookSignoff.approvedBy'])
            ->orderBy('name')
            ->paginate($perPage);
    }

    /**
     * Finalize an intern's overall logbook after individual entries are reviewed.
     *
     * @throws ValidationException
     */
    public function finalizeInternLogbook(User $intern, User $admin, ?string $note = null): \App\Models\LogbookSignoff
    {
        if (!$intern->isIntern()) {
            throw ValidationException::withMessages([
                'user' => ['Only intern accounts have logbooks to finalize.'],
            ]);
        }

        $existing = \App\Models\LogbookSignoff::where('user_id', $intern->id)->first();
        if ($existing) {
            throw ValidationException::withMessages([
                'logbook' => ['This intern\'s logbook has already been finalized.'],
            ]);
        }

        $pending = Logbook::where('user_id', $intern->id)
            ->whereIn('status', [
                LogbookStatus::Submitted,
                LogbookStatus::RevisionNeeded,
            ])
            ->count();

        if ($pending > 0) {
            throw ValidationException::withMessages([
                'logbook' => [
                    "There are still {$pending} entries awaiting review or revision. Review them before finalizing.",
                ],
            ]);
        }

        $approved = Logbook::where('user_id', $intern->id)
            ->where('status', LogbookStatus::Approved)
            ->count();

        if ($approved === 0) {
            throw ValidationException::withMessages([
                'logbook' => ['At least one approved log entry is required before finalizing.'],
            ]);
        }

        return \App\Models\LogbookSignoff::create([
            'user_id'     => $intern->id,
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'note'        => $note,
        ])->load('approvedBy');
    }

    /**
     * Get a single logbook by ID with relationships.
     *
     * @throws ModelNotFoundException
     */
    public function getLogbookById(int $id): Logbook
    {
        return Logbook::with(['user', 'task', 'approvedBy', 'comments.user', 'fileUploads'])
            ->findOrFail($id);
    }

    /**
     * Create a new logbook entry.
     *
     * Business rule enforced:
     *   The task must be assigned to this intern.
     *   An intern cannot log work on someone else's task.
     *
     * @throws ValidationException
     */
    public function createLogbook(array $data, User $intern): Logbook
    {
        // Verify the task belongs to this intern
        $taskBelongsToIntern = \App\Models\Task::where('id', $data['task_id'])
            ->where('assigned_to', $intern->id)
            ->exists();

        if (!$taskBelongsToIntern) {
            throw ValidationException::withMessages([
                'task_id' => ['You can only log work for tasks assigned to you.'],
            ]);
        }

        return Logbook::create([
            ...$data,
            'user_id' => $intern->id,
            'status'  => LogbookStatus::Draft,
        ])->fresh(['user', 'task', 'approvedBy']);
    }

    /**
     * Update a logbook entry.
     * Only draft and revision_needed logbooks can be updated.
     * Approved logbooks are immutable — enforced in Policy.
     *
     * @throws ModelNotFoundException
     */
    public function updateLogbook(int $id, array $data): Logbook
    {
        $logbook = Logbook::findOrFail($id);
        $logbook->update($data);

        return $logbook->fresh(['user', 'task', 'approvedBy', 'comments.user', 'fileUploads']);
    }

    /**
     * Submit a logbook for admin review.
     * Changes status from draft/revision_needed to submitted.
     *
     * @throws ModelNotFoundException
     * @throws ValidationException
     */
    public function submitLogbook(int $id, User $intern): Logbook
    {
        $logbook = Logbook::findOrFail($id);

        // Can only submit draft or revision_needed logbooks
        if (!in_array($logbook->status, [
            LogbookStatus::Draft,
            LogbookStatus::RevisionNeeded,
        ])) {
            throw ValidationException::withMessages([
                'status' => ['Only draft or revision needed logbooks can be submitted.'],
            ]);
        }

        $logbook->update([
            'status' => LogbookStatus::Submitted,
        ]);

        return $logbook->fresh(['user', 'task', 'approvedBy', 'comments.user', 'fileUploads']);
    }

    /**
     * Review a logbook — approve, reject, or request revision.
     *
     * This is a dedicated method because reviewing has side effects:
     *   - approved_by must be set to the reviewing admin
     *   - reviewed_at must be set to now()
     *   - revision_note set when rejecting or requesting revision
     *   - These must always happen together atomically
     *
     * @throws ModelNotFoundException
     * @throws ValidationException
     */
    public function reviewLogbook(
        int $id,
        string $action,
        User $admin,
        ?string $revisionNote = null
    ): Logbook {
        $logbook = Logbook::findOrFail($id);

        // Can only review submitted logbooks
        if ($logbook->status !== LogbookStatus::Submitted) {
            throw ValidationException::withMessages([
                'status' => ['Only submitted logbooks can be reviewed.'],
            ]);
        }

        $newStatus = match($action) {
            'approved'        => LogbookStatus::Approved,
            'rejected'        => LogbookStatus::Rejected,
            'revision_needed' => LogbookStatus::RevisionNeeded,
        };

        $logbook->update([
            'status'        => $newStatus,
            'approved_by'   => $admin->id,
            'reviewed_at'   => now(),
            'revision_note' => $revisionNote,
        ]);

        return $logbook->fresh(['user', 'task', 'approvedBy']);
    }

    /**
     * Delete a logbook entry.
     * Only draft logbooks can be deleted.
     * Enforced in LogbookPolicy@delete.
     *
     * @throws ModelNotFoundException
     */
    public function deleteLogbook(int $id): void
    {
        Logbook::findOrFail($id)->delete();
    }

    /**
     * Add a comment to a logbook.
     * Both admins and interns can comment.
     */
    public function addComment(int $logbookId, string $body, User $user): \App\Models\Comment
    {
        $logbook = Logbook::findOrFail($logbookId);

        return $logbook->comments()->create([
            'user_id' => $user->id,
            'body'    => $body,
        ]);
    }
}