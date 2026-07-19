<?php

namespace App\Contracts;

use App\Models\Achievement;
use App\Models\User;

/**
 * AchievementRule Interface
 *
 * Every achievement in Elevex is a class implementing this interface.
 *
 * Why an interface?
 * AchievementService loops through ALL rules and calls evaluate()
 * on each one. Every rule must have the same method signature
 * so the service can treat them all identically.
 *
 * Adding a new achievement:
 *   1. Create a new class implementing this interface
 *   2. Add a row to the achievements table via AchievementSeeder
 *   That's it — AchievementService picks it up automatically.
 *   Zero changes to existing code. Open/Closed Principle.
 */
interface AchievementRule
{
    /**
     * Evaluate whether this user has earned this achievement.
     * Called by AchievementService after every relevant event.
     */
    public function evaluate(User $user): bool;

    /**
     * Return the Achievement model this rule awards.
     * Used by AchievementService to create the user_achievements record.
     */
    public function achievement(): Achievement;
}