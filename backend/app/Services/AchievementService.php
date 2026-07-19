<?php

namespace App\Services;

use App\Contracts\AchievementRule;
use App\Models\User;
use App\Rules\Achievements\ConsistencyChampionRule;
use App\Rules\Achievements\FastFinisherRule;
use App\Rules\Achievements\MilestoneMasterRule;
use App\Rules\Achievements\PerfectAttendanceRule;
use App\Rules\Achievements\TeamPlayerRule;
use App\Rules\Achievements\ThirtyDayStreakRule;
use App\Rules\Achievements\TopPerformerRule;

/**
 * AchievementService
 *
 * Evaluates all achievement rules for a given user
 * and awards any achievements they have earned.
 *
 * This service is the orchestrator — it never contains
 * achievement logic itself. Logic lives in Rule classes.
 *
 * Adding a new achievement:
 *   1. Create a new Rule class implementing AchievementRule
 *   2. Add it to the $rules array below
 *   3. Add a row to achievements table via seeder
 *   Zero changes to this service. Open/Closed Principle.
 *
 * Called by:
 *   CheckAchievementsCommand (nightly scheduler)
 *   PerformanceController after metrics are calculated
 */
class AchievementService
{
    /**
     * All registered achievement rules.
     * Every rule is evaluated for every user on each run.
     */
    private array $rules = [
        PerfectAttendanceRule::class,
        FastFinisherRule::class,
        ThirtyDayStreakRule::class,
        TeamPlayerRule::class,
        TopPerformerRule::class,
        MilestoneMasterRule::class,
        ConsistencyChampionRule::class,
    ];

    /**
     * Evaluate all achievement rules for a specific user.
     * Awards any achievements they qualify for that they
     * haven't already received.
     *
     * Returns array of newly awarded achievement names.
     */
    public function evaluateForUser(User $user): array
    {
        $awarded = [];

        foreach ($this->rules as $ruleClass) {
            /** @var AchievementRule $rule */
            $rule        = new $ruleClass();
            $achievement = $rule->achievement();

            // Skip if user already has this achievement
            $alreadyAwarded = $user->achievements()
                ->where('achievement_id', $achievement->id)
                ->exists();

            if ($alreadyAwarded) {
                continue;
            }

            // Evaluate the rule
            if ($rule->evaluate($user)) {
                // Award the achievement
                $user->achievements()->attach($achievement->id, [
                    'awarded_at' => now(),
                ]);

                $awarded[] = $achievement->name;
            }
        }

        return $awarded;
    }

    /**
     * Evaluate achievements for ALL interns.
     * Called by CheckAchievementsCommand nightly.
     */
    public function evaluateForAll(): void
    {
        $interns = User::where('role', 'intern')->get();

        foreach ($interns as $intern) {
            $this->evaluateForUser($intern);
        }
    }
}