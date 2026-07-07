<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * PerformanceMetric Model
 *
 * System computed scores for an intern's performance.
 * Written exclusively by PerformanceService — never by humans directly.
 *
 * This is the OUTPUT of our performance formula:
 *
 *   completion_rate  × 40% — tasks completed vs total assigned
 *   deadline_score   × 20% — tasks completed on time vs total
 *   consistency_score × 15% — regularity of logbook submissions
 *   quality_score    × 15% — derived from admin evaluation average score
 *   teamwork_score   × 10% — derived from admin evaluation teamwork score
 *   ─────────────────────────────────────────────────────────────────────
 *   overall_score         — weighted sum of all above
 *
 * All score columns store percentages between 0.00 and 100.00.
 *
 * When is this recalculated?
 *   - TaskCompleted event fires
 *   - LogbookApproved event fires
 *   - EvaluationSubmitted event fires
 *   - Nightly scheduler runs RecalculatePerformanceCommand
 *
 * One record per intern per internship.
 * On recalculation the existing record is UPDATED not duplicated.
 * This is handled by PerformanceService using updateOrCreate().
 *
 * Relationships:
 *   user        — the intern these metrics belong to
 *   internship  — which internship period these metrics cover
 */
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

    // =========================================================
    // Helper Methods
    // =========================================================

    /**
     * Calculate the weighted overall score from individual components.
     *
     * This mirrors the formula in PerformanceService.
     * Useful for displaying the breakdown in the UI without
     * recalculating from scratch.
     *
     * Returns a float between 0.00 and 100.00.
     */
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

    /**
     * Get a human readable performance grade based on overall score.
     *
     *   90-100 → Excellent
     *   75-89  → Good
     *   60-74  → Satisfactory
     *   below  → Needs Improvement
     */
    public function grade(): string
    {
        return match(true) {
            $this->overall_score >= 90 => 'Excellent',
            $this->overall_score >= 75 => 'Good',
            $this->overall_score >= 60 => 'Satisfactory',
            default                    => 'Needs Improvement',
        };
    }

    // =========================================================
    // Relationships
    // =========================================================

    /**
     * The intern these metrics belong to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The internship period these metrics cover.
     */
    public function internship(): BelongsTo
    {
        return $this->belongsTo(Internship::class);
    }
}