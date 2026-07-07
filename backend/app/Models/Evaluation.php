<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Evaluation Model
 *
 * An admin's qualitative assessment of an intern's performance.
 * This is HUMAN input — an admin scoring an intern on soft skills.
 *
 * Important distinction from PerformanceMetric:
 *   Evaluation       — human judgment, written once by an admin
 *   PerformanceMetric — system computed, recalculated automatically
 *
 * These are kept as separate models because they have
 * completely different write patterns and ownership:
 *   Evaluation        — admin writes it, rarely changes
 *   PerformanceMetric — PerformanceService writes it, changes often
 *
 * Scoring dimensions (1-5 scale):
 *   communication_score   — how well the intern communicates
 *   professionalism_score — conduct, punctuality, attitude
 *   initiative_score      — proactiveness, self-starting ability
 *   problem_solving_score — analytical thinking, debugging skills
 *   teamwork_score        — collaboration, helping others
 *
 * These scores feed into PerformanceService:
 *   quality_score  = average of all five dimensions
 *   teamwork_score = teamwork_score dimension directly
 *
 * One evaluation per intern per internship.
 * Enforced by unique constraint on [user_id, internship_id].
 *
 * Relationships:
 *   user         — the intern being evaluated
 *   internship   — which internship period this covers
 *   evaluatedBy  — the admin who wrote this evaluation
 */
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

    // =========================================================
    // Helper Methods
    // =========================================================

    /**
     * Calculate the average score across all five dimensions.
     * Used by PerformanceService as the quality_score input.
     *
     * Returns a float between 1.0 and 5.0.
     */
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

    /**
     * Convert the average score (1-5) to a percentage (0-100).
     * Used by PerformanceService to calculate quality_score.
     *
     * Formula: ((score - 1) / 4) * 100
     *   score 1 → 0%
     *   score 3 → 50%
     *   score 5 → 100%
     */
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

    // =========================================================
    // Relationships
    // =========================================================

    /**
     * The intern being evaluated.
     */
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

    /**
     * The admin who wrote this evaluation.
     * Foreign key is 'evaluated_by' not the default 'user_id'.
     */
    public function evaluatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluated_by');
    }
}