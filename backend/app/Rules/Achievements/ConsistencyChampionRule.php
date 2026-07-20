<?php

namespace App\Rules\Achievements;

use App\Contracts\AchievementRule;
use App\Models\Achievement;
use App\Models\PerformanceMetric;
use App\Models\User;

/**
 * ConsistencyChampionRule
 *
 * Awards "Consistency Champion" when an intern maintains
 * a logbook consistency score above 95% for a full internship.
 *
 * Like TopPerformerRule — reads from performance_metrics
 * rather than calculating itself. PerformanceService owns
 * the calculation. This rule only reads the result.
 */
class ConsistencyChampionRule implements AchievementRule
{
    public function evaluate(User $user): bool
    {
        return PerformanceMetric::where('user_id', $user->id)
            ->where('consistency_score', '>=', 95)
            ->exists();
    }

    public function achievement(): Achievement
    {
        return Achievement::where('key', 'consistency_champion')->firstOrFail();
    }
}