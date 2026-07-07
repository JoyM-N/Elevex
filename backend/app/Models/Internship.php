<?php

namespace App\Models;

use App\Enums\InternshipStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Internship extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'supervisor_id',
        'department',
        'university',
        'student_id',
        'start_date',
        'end_date',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
            'status'     => InternshipStatus::class,
        ];
    }

    public function isActive(): bool
    {
        return $this->status === InternshipStatus::Active;
    }

    public function isTerminal(): bool
    {
        return $this->status->isTerminal();
    }
 function durationInDays(): int
    {
        return $this->start_date->diffInDays($this->end_date);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function evaluation(): HasOne
    {
        return $this->hasOne(Evaluation::class);
    }

    public function performanceMetric(): HasOne
    {
        return $this->hasOne(PerformanceMetric::class);
    }

    public function recommendationLetter(): HasOne
    {
        return $this->hasOne(RecommendationLetter::class);
    }
}