<?php

namespace App\Models;

use App\Enums\LogbookStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Logbook Model
 *
 * A daily log entry submitted by an intern documenting their work.
 * Every logbook entry is tied to a specific task they worked on.
 *
 * Status flow:
 *   draft           — saved but not submitted yet
 *   submitted       — intern submitted, waiting for admin review
 *   approved        — admin approved, becomes READ-ONLY from this point
 *   rejected        — admin rejected, intern must resubmit
 *   revision_needed — admin requested changes, intern can edit and resubmit
 *
 * Read-only rule:
 *   Once a logbook is approved it can never be edited again.
 *   This is enforced in LogbookPolicy using isLocked().
 *   The database does not enforce this — the application does.
 *
 * Polymorphic relationships:
 *   comments    — admins and interns can comment on logbooks
 *   fileUploads — interns can attach proof of work (images, PDFs)
 *
 * Relationships:
 *   user       — the intern who submitted this logbook
 *   task       — the task this logbook entry is about
 *   approvedBy — the admin who reviewed this logbook
 *   comments   — comments left on this logbook
 *   fileUploads — proof of work files attached to this logbook
 */
class Logbook extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'task_id',
        'approved_by',
        'date',
        'hours_worked',
        'description',
        'blockers',
        'learning_outcome',
        'status',
        'revision_note',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'date'        => 'date',
            'reviewed_at' => 'datetime',
            'status'      => LogbookStatus::class,
            'hours_worked' => 'decimal:2',
        ];
    }

    // =========================================================
    // Status Helper Methods
    // =========================================================

    /**
     * Is this logbook locked for editing?
     * Approved logbooks can never be modified.
     * Used in LogbookPolicy to prevent edits.
     */
    public function isLocked(): bool
    {
        return $this->status->isLocked();
    }

    /**
     * Is this logbook approved?
     */
    public function isApproved(): bool
    {
        return $this->status === LogbookStatus::Approved;
    }

    /**
     * Is this logbook waiting for admin review?
     */
    public function isPendingReview(): bool
    {
        return $this->status === LogbookStatus::Submitted;
    }

    /**
     * Does this logbook need revision from the intern?
     */
    public function needsRevision(): bool
    {
        return $this->status === LogbookStatus::RevisionNeeded;
    }

    // =========================================================
    // Relationships
    // =========================================================

    /**
     * The intern who submitted this logbook.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The task this logbook entry documents work on.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * The admin who reviewed this logbook.
     * Null until an admin takes action.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Comments left on this logbook.
     * Polymorphic — same comments table used for tasks too.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    /**
     * Proof of work files attached to this logbook.
     * Polymorphic — same file_uploads table used across the system.
     */
    public function fileUploads(): MorphMany
    {
        return $this->morphMany(FileUpload::class, 'uploadable');
    }
}