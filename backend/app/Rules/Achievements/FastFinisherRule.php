<?php

namespace App\Rules\Achievements;

use App\Contracts\AchievementRule;
use App\Enums\TaskStatus;
use App\Models\Achievement;
use App\Models\User;

/**
 * FastFinisherRule
 *
 * Awards "Fast Finisher" when an intern has completed
 * at least 5 tasks before their deadline.
 *
 * A task is considered completed ahead of time when:
 *   completed_at < deadline
 * Both columns must be set — general tasks without
 * deadlines are excluded from this calculation.
 */
class FastFinisherRule implements AchievementRule
{
    public function evaluate(User $user): bool
    {
        $earlyCompletions = $user->tasks()
            ->where('status', TaskStatus::Completed)
            ->whereNotNull('deadline')
            ->whereNotNull('completed_at')
            ->whereColumn('completed_at', '<', 'deadline')
            ->count();

        return $earlyCompletions >= 5;
    }

    public function achievement(): Achievement
    {
        return Achievement::where('key', 'fast_finisher')->firstOrFail();
    }
}