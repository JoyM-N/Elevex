<?php

namespace App\Rules\Achievements;

use App\Contracts\AchievementRule;
use App\Models\Achievement;
use App\Models\User;
use Carbon\Carbon;

/**
 * ThirtyDayStreakRule
 *
 * Awards "30-Day Streak" when an intern has submitted
 * at least one logbook every day for 30 consecutive days.
 *
 * How streak is calculated:
 *   Get all distinct logbook dates ordered descending.
 *   Walk back from today counting consecutive days.
 *   If we reach 30 without a gap — streak achieved.
 */
class ThirtyDayStreakRule implements AchievementRule
{
    public function evaluate(User $user): bool
    {
        // Get all distinct logbook dates for this user, newest first
        $dates = $user->logbooks()
            ->distinct('date')
            ->orderByDesc('date')
            ->pluck('date')
            ->map(fn($date) => Carbon::parse($date)->toDateString())
            ->toArray();

        if (count($dates) < 30) {
            return false;
        }

        $streak = 1;
        for ($i = 0; $i < count($dates) - 1; $i++) {
            $current  = Carbon::parse($dates[$i]);
            $next     = Carbon::parse($dates[$i + 1]);

            // Check if dates are consecutive
            if ($current->diffInDays($next) === 1) {
                $streak++;
                if ($streak >= 30) {
                    return true;
                }
            } else {
                // Gap found — reset streak
                $streak = 1;
            }
        }

        return false;
    }

    public function achievement(): Achievement
    {
        return Achievement::where('key', 'thirty_day_streak')->firstOrFail();
    }
}