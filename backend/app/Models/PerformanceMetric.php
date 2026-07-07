<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
 
class PerformanceMetric extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'internship_id',
        'completion_rate',
        'deadline_score',
        'consistency_score',
        'quality_score',
        'teamwork_score',
        'overall_score',
        'calculated_at',
    ];

    protected function casts(): array
    {
        return [
            'completion_rate'   => 'decimal:2',
            'deadline_score'    => 'decimal:2',
            'consistency_score' => 'decimal:2',
            'quality_score'     => 'decimal:2',
            'teamwork_score'    => 'decimal:2',
            'overall_score'     => 'decimal:2',
            'calculated_at'     => 'datetime',
        ];
    }

    public function calculateOverallScore(): float
    {
        return round(
            ($this->completion_rate  * 0.40) +
            ($this->deadline_score   * 0.20) +
            ($this->consistency_score * 0.15) +
            ($this->quality_score    * 0.15) +
            ($this->teamwork_score   * 0.10),
            2
        );
    }

    public function grade(): string
    {
        return match(true) {
            $this->overall_score >= 90 => 'Excellent',
            $this->overall_score >= 75 => 'Good',
            $this->overall_score >= 60 => 'Satisfactory',
            default                    => 'Needs Improvement',
        };
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function internship(): BelongsTo
    {
        return $this->belongsTo(Internship::class);
    }
}