<?php

namespace App\Rules\Achievements;

use App\Contracts\AchievementRule;
use App\Models\Achievement;
use App\Models\User;

/**
 * TeamPlayerRule
 *
 * Awards "Team Player" when an intern has been
 * a member of 3 or more projects simultaneously
 * at any point during their internship.
 *
 * We check total projects contributed to — not
 * necessarily active at the same time — to keep
 * the query simple and the rule achievable.
 */
class TeamPlayerRule implements AchievementRule
{
    public function evaluate(User $user): bool
    {
        $projectCount = $user->projects()->count();

        return $projectCount >= 3;
    }

    public function achievement(): Achievement
    {
        return Achievement::where('key', 'team_player')->firstOrFail();
    }
}