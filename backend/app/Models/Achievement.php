<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Achievement Model
 *
 * Represents a single achievement definition in the master list.
 * Seeded with predefined achievements — adding a new achievement
 * requires a new row here plus a new AchievementRule class.
 *
 * How the achievement system works:
 *   1. A domain event fires (TaskCompleted, LogbookApproved etc.)
 *   2. CheckAchievements listener picks it up
 *   3. AchievementService loops through all AchievementRule classes
 *   4. Each rule evaluates whether the intern qualifies
 *   5. If yes, a row is inserted into user_achievements pivot
 *
 * The 'key' column is what AchievementService uses to identify
 * achievements programmatically. Never change a key once set —
 * it would break the rule class mapping.
 *
 * IMPORTANT:
 *   Achievement names like "Fast Finisher" or "Top Performer"
 *   are NEVER shown in recommendation letters.
 *   RecommendationService translates them into professional
 *   language instead.
 *   e.g. "Fast Finisher" → "demonstrated exceptional ability
 *   to deliver work ahead of schedule"
 *
 * Predefined achievements:
 *   perfect_attendance   — logbook every working day for a month
 *   fast_finisher        — 5 tasks completed ahead of deadline
 *   thirty_day_streak    — 30 consecutive days of submissions
 *   team_player          — contributed to 3+ projects simultaneously
 *   top_performer        — overall performance score above 90%
 *   milestone_master     — all tasks in a milestone done before due date
 *   consistency_champion — consistency score above 95% for full internship
 *
 * Relationships:
 *   users — all interns who have earned this achievement
 *           pivot carries awarded_at timestamp
 */
class Achievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'description',
        'icon',
    ];

    // =========================================================
    // Relationships
    // =========================================================

    /**
     * All interns who have earned this achievement.
     * The pivot table carries awarded_at — when they earned it.
     *
     * Usage:
     *   $achievement->users                        — all interns who earned it
     *   $achievement->users->first()->pivot->awarded_at — when they earned it
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_achievements')
            ->withPivot('awarded_at')
            ->withTimestamps();
    }
}