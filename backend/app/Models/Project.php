<?php

namespace App\Models;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Project Model
 *
 * The primary work container in Elevex.
 * Everything revolves around projects.
 *
 * Hierarchy:
 *   Project → Milestone → Task → Logbook
 *
 * Locking rule:
 *   Completed and Cancelled projects are read-only.
 *   No edits, no new members, no new milestones.
 *   Enforced in ProjectPolicy using isLocked().
 *
 * Relationships:
 *   createdBy  — the admin who created this project
 *   members    — interns assigned via project_members pivot
 *   milestones — measurable checkpoints inside this project
 *   tasks      — all tasks across all milestones (via milestones)
 */
class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'status',
        'priority',
        'start_date',
        'end_date',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'status'     => ProjectStatus::class,
            'priority'   => ProjectPriority::class,
            'start_date' => 'date',
            'end_date'   => 'date',
        ];
    }

    // =========================================================
    // Status Helper Methods
    // =========================================================

    /**
     * Is this project locked for editing?
     * Completed and Cancelled projects cannot be modified.
     * Used in ProjectPolicy to prevent edits.
     */
    public function isLocked(): bool
    {
        return $this->status->isLocked();
    }

    /**
     * Is this project currently active?
     */
    public function isActive(): bool
    {
        return $this->status === ProjectStatus::Active;
    }

    /**
     * How many days until this project is due?
     * Negative means it is overdue.
     */
    public function daysUntilDeadline(): int
    {
        return now()->diffInDays($this->end_date, false);
    }

    // =========================================================
    // Relationships
    // =========================================================

    /**
     * The admin who created this project.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * All interns assigned to this project.
     * The pivot table carries each member's team_role.
     *
     * Usage:
     *   $project->members        — collection of User models
     *   $project->members->first()->pivot->team_role — their role
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_members')
            ->withPivot('team_role')
            ->withTimestamps();
    }

    /**
     * All milestones inside this project.
     * Ordered by start date so they display chronologically.
     */
    public function milestones(): HasMany
    {
        return $this->hasMany(Milestone::class)->orderBy('start_date');
    }

    /**
     * All tasks across all milestones in this project.
     * HasManyThrough lets us jump two levels:
     *   Project → Milestone → Task
     *
     * Usage:
     *   $project->tasks — all tasks without loading milestones first
     */
    public function tasks(): HasManyThrough
    {
        return $this->hasManyThrough(Task::class, Milestone::class);
    }
}