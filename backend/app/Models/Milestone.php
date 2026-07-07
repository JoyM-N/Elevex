<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

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

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isOverdue(): bool
    {
        return !$this->isCompleted() && now()->isAfter($this->end_date);
    }

    public function completionPercentage(): float
    {
        $total = $this->tasks()->count();

        if ($total === 0) {
            return 0;
        }

        $completed = $this->tasks()->where('status', 'completed')->count();

        return round(($completed / $total) * 100, 2);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function logbooks(): HasManyThrough
    {
        return $this->hasManyThrough(Logbook::class, Task::class);
    }
}