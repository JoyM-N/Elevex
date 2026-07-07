<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

/**
 * Milestone Model
 *
 * A measurable checkpoint inside a project.
 * Breaks a large project into smaller trackable phases.
 *
 * Example:
 *   Project: "Build Elevex"
 *     Milestone 1: "Authentication System"  — due week 1
 *     Milestone 2: "Project Management"     — due week 2
 *     Milestone 3: "Performance Engine"     — due week 3
 *
 * Hierarchy position:
 *   Project → Milestone → Task → Logbook
 *
 * Cascade rule:
 *   If a project is deleted, its milestones are deleted too.
 *   Milestones have no independent meaning without their project.
 *
 * Relationships:
 *   project  — the project this milestone belongs to
 *   tasks    — all tasks under this milestone
 *   logbooks — all logbooks across all tasks in this milestone
 */
class Milestone extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'start_date',
        'end_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
        ];
    }

    // =========================================================
    // Status Helper Methods
    // =========================================================

    /**
     * Is this milestone completed?
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Is this milestone currently being worked on?
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Is this milestone overdue?
     * Checks if end date has passed and it is not completed yet.
     */
    public function isOverdue(): bool
    {
        return !$this->isCompleted() && now()->isAfter($this->end_date);
    }

    /**
     * Calculate completion percentage based on tasks.
     * Used on project dashboards and progress bars.
     */
    public function completionPercentage(): float
    {
        $total = $this->tasks()->count();

        if ($total === 0) {
            return 0;
        }

        $completed = $this->tasks()->where('status', 'completed')->count();

        return round(($completed / $total) * 100, 2);
    }

    // =========================================================
    // Relationships
    // =========================================================

    /**
     * The project this milestone belongs to.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * All tasks under this milestone.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * All logbooks across all tasks in this milestone.
     * HasManyThrough lets us jump two levels:
     *   Milestone → Task → Logbook
     *
     * Usage:
     *   $milestone->logbooks — without loading tasks first
     */
    public function logbooks(): HasManyThrough
    {
        return $this->hasManyThrough(Logbook::class, Task::class);
    }
}