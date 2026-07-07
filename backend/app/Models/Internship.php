<?php

namespace App\Models;

use App\Enums\InternshipStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Internship Model
 *
 * Represents one internship engagement for a user.
 * A user can have multiple internships over time — each is its own record.
 *
 * CRITICAL RULE: Internship records are NEVER hard deleted.
 * They are the permanent historical record of someone's internship.
 * SoftDeletes is here as a safety net only.
 * The application layer (InternshipPolicy) prevents deletion entirely.
 *
 * Relationships:
 *   user       — the intern this internship belongs to
 *   supervisor — the admin overseeing this internship
 *   evaluation — the admin's qualitative assessment
 *   performanceMetric — the system computed scores
 *   recommendationLetter — the generated recommendation letter
 */
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

    // =========================================================
    // Status Helper Methods
    //
    // Clean boolean checks used in Policies and Services
    // instead of comparing enum values directly everywhere.
    // =========================================================

    /**
     * Is this internship currently active?
     */
    public function isActive(): bool
    {
        return $this->status === InternshipStatus::Active;
    }

    /**
     * Has this internship ended — completed, terminated, or archived?
     * Terminal internships cannot be modified.
     */
    public function isTerminal(): bool
    {
        return $this->status->isTerminal();
    }

    /**
     * Calculate how many days this internship lasted.
     * Used in recommendation letters and reports.
     */
    public function durationInDays(): int
    {
        return $this->start_date->diffInDays($this->end_date);
    }

    // =========================================================
    // Relationships
    // =========================================================

    /**
     * The intern this internship belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The admin supervising this internship.
     */
    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    /**
     * The admin's qualitative evaluation for this internship period.
     * One evaluation per internship.
     */
    public function evaluation(): HasOne
    {
        return $this->hasOne(Evaluation::class);
    }

    /**
     * The system computed performance metrics for this internship period.
     * One metrics record per internship.
     */
    public function performanceMetric(): HasOne
    {
        return $this->hasOne(PerformanceMetric::class);
    }

    /**
     * The recommendation letter for this internship period.
     */
    public function recommendationLetter(): HasOne
    {
        return $this->hasOne(RecommendationLetter::class);
    }
}