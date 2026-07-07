<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'internship_id',
        'evaluated_by',
        'communication_score',
        'professionalism_score',
        'initiative_score',
        'problem_solving_score',
        'teamwork_score',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'communication_score'   => 'integer',
            'professionalism_score' => 'integer',
            'initiative_score'      => 'integer',
            'problem_solving_score' => 'integer',
            'teamwork_score'        => 'integer',
        ];
    }

    public function averageScore(): float
    {
        return round((
            $this->communication_score +
            $this->professionalism_score +
            $this->initiative_score +
            $this->problem_solving_score +
            $this->teamwork_score
        ) / 5, 2);
    }

    public function averageScoreAsPercentage(): float
    {
        return round((($this->averageScore() - 1) / 4) * 100, 2);
    }

    /**
     * Convert teamwork score (1-5) to a percentage (0-100).
     * Used by PerformanceService for the teamwork_score metric.
     */
    public function teamworkScoreAsPercentage(): float
    {
        return round((($this->teamwork_score - 1) / 4) * 100, 2);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The internship period this evaluation covers.
     */
    public function internship(): BelongsTo
    {
        return $this->belongsTo(Internship::class);
    }

  
    public function evaluatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluated_by');
    }
}