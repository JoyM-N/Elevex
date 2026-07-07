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

    public function isLocked(): bool
    {
        return $this->status->isLocked();
    }

    public function isActive(): bool
    {
        return $this->status === ProjectStatus::Active;
    }

    public function daysUntilDeadline(): int
    {
        return now()->diffInDays($this->end_date, false);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_members')
            ->withPivot('team_role')
            ->withTimestamps();
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(Milestone::class)->orderBy('start_date');
    }

    public function tasks(): HasManyThrough
    {
        return $this->hasManyThrough(Task::class, Milestone::class);
    }
}