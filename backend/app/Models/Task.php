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

    public function isTerminal(): bool
    {
        return $this->status->isTerminal();
    }

    public function isOverdue(): bool
    {
        return !$this->isTerminal()
            && $this->deadline
            && now()->isAfter($this->deadline);
    }

    public function wasCompletedOnTime(): bool
    {
        if (!$this->completed_at || !$this->deadline) {
            return false;
        }

        return $this->completed_at->lte($this->deadline);
    }

    public function isProjectTask(): bool
    {
        return $this->task_type === TaskType::ProjectTask;
    }

    public function isGeneralTask(): bool
    {
        return $this->task_type === TaskType::GeneralTask;
    }

    public function milestone(): BelongsTo
    {
        return $this->belongsTo(Milestone::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function logbooks(): HasMany
    {
        return $this->hasMany(Logbook::class);
    }

    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function fileUploads(): MorphMany
    {
        return $this->morphMany(FileUpload::class, 'uploadable');
    }
}