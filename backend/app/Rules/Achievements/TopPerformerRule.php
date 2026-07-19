<?php

namespace App\Rules\Achievements;

use App\Contracts\AchievementRule;
use App\Models\Achievement;
use App\Models\PerformanceMetric;
use App\Models\User;

/**
 * TopPerformerRule
 *
 * Awards "Top Performer" when an intern's overall
 * performance score is 90% or above.
 *
 * Reads from performance_metrics table which is
 * calculated and maintained by PerformanceService.
 * This rule never calculates scores itself —
 * it only reads the already-computed overall_score.
 */
class TopPerformerRule implements AchievementRule
{
    public function evaluate(User $user): bool
    {
        return PerformanceMetric::where('user_id', $user->id)
            ->where('overall_score', '>=', 90)
            ->exists();
    }

    public function achievement(): Achievement
    {
        return Achievement::where('key', 'top_performer')->firstOrFail();
    }
}