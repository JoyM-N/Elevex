<?php

namespace App\Models;

use App\Enums\ProjectPriority;
use App\Enums\TaskStatus;
use App\Enums\TaskType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Task Model
 *
 * The actual unit of work assigned to an intern.
 * Tasks sit inside milestones which sit inside projects.
 *
 * Two types:
 *   project_task — belongs to a milestone inside a project
 *   general_task — standalone, not tied to any project
 *                  e.g. "Read the company handbook"
 *
 * Performance Engine columns:
 *   estimated_hours — expected time to complete
 *   actual_hours    — real time spent
 *   deadline        — when it should be done
 *   completed_at    — when it was actually done
 *
 * These four columns are used by PerformanceService to calculate
 * deadline adherence and task completion scores.
 *
 * Locking rule:
 *   Completed and Cancelled tasks cannot be modified.
 *   Enforced in TaskPolicy using isTerminal().
 *
 * Polymorphic relationships:
 *   comments — tasks can receive comments from admins and interns
 *
 * Relationships:
 *   milestone  — the milestone this task belongs to (nullable for general tasks)
 *   assignedTo — the intern responsible for this task
 *   createdBy  — the admin who created and assigned this task
 *   logbooks   — daily log entries submitted for this task
 *   comments   — comments left on this task
 */
class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'milestone_id',
        'assigned_to',
        'created_by',
        'title',
        'description',
        'task_type',
        'status',
        'priority',
        'estimated_hours',
        'actual_hours',
        'deadline',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'task_type'    => TaskType::class,
            'status'       => TaskStatus::class,
            'priority'     => ProjectPriority::class,
            'deadline'     => 'date',
            'completed_at' => 'datetime',
        ];
    }

    // =========================================================
    // Status Helper Methods
    // =========================================================

    /**
     * Is this task completed or cancelled?
     * Terminal tasks are read-only — enforced in TaskPolicy.
     */
    public function isTerminal(): bool
    {
        return $this->status->isTerminal();
    }

    /**
     * Is this task overdue?
     * Only relevant for tasks that are not yet completed.
     */
    public function isOverdue(): bool
    {
        return !$this->isTerminal()
            && $this->deadline
            && now()->isAfter($this->deadline);
    }

    /**
     * Was this task completed on time?
     * Used by PerformanceService for deadline adherence calculation.
     */
    public function wasCompletedOnTime(): bool
    {
        if (!$this->completed_at || !$this->deadline) {
            return false;
        }

        return $this->completed_at->lte($this->deadline);
    }

    /**
     * Is this a project task (belongs to a milestone)?
     */
    public function isProjectTask(): bool
    {
        return $this->task_type === TaskType::ProjectTask;
    }

    /**
     * Is this a general task (standalone)?
     */
    public function isGeneralTask(): bool
    {
        return $this->task_type === TaskType::GeneralTask;
    }

    // =========================================================
    // Relationships
    // =========================================================

    /**
     * The milestone this task belongs to.
     * Null for general tasks.
     */
    public function milestone(): BelongsTo
    {
        return $this->belongsTo(Milestone::class);
    }

    /**
     * The intern this task is assigned to.
     * Foreign key is 'assigned_to' not the default 'user_id'.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * The admin who created and assigned this task.
     * Foreign key is 'created_by' not the default 'user_id'.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Daily logbook entries submitted for this task.
     * One intern can submit multiple logbooks for the same task
     * across different days.
     */
    public function logbooks(): HasMany
    {
        return $this->hasMany(Logbook::class);
    }

    /**
     * Comments left on this task.
     * Polymorphic — same comments table used for logbooks too.
     *
     * MorphMany means: "get all comments where
     * commentable_type = App\Models\Task
     * and commentable_id = this task's id"
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    /**
     * Files uploaded to this task.
     * Polymorphic — same file_uploads table used across the system.
     */
    public function fileUploads(): MorphMany
    {
        return $this->morphMany(FileUpload::class, 'uploadable');
    }
}