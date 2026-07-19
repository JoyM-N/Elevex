<?php

namespace App\Rules\Achievements;

use App\Contracts\AchievementRule;
use App\Enums\TaskStatus;
use App\Models\Achievement;
use App\Models\Milestone;
use App\Models\User;

/**
 * MilestoneMasterRule
 *
 * Awards "Milestone Master" when an intern has completed
 * all tasks in at least one milestone before its due date.
 *
 * Checks:
 *   1. Find milestones where this intern has tasks
 *   2. For each milestone check if ALL tasks assigned
 *      to this intern are completed before the milestone end_date
 *   3. If any milestone qualifies — award the achievement
 */
class MilestoneMasterRule implements AchievementRule
{
    public function evaluate(User $user): bool
    {
        // Get all milestones where this intern has at least one task
        $milestones = Milestone::whereHas('tasks', function ($query) use ($user) {
            $query->where('assigned_to', $user->id);
        })->get();

        foreach ($milestones as $milestone) {
            // Get all tasks assigned to this intern in this milestone
            $internTasks = $milestone->tasks()
                ->where('assigned_to', $user->id)
                ->get();

            if ($internTasks->isEmpty()) {
                continue;
            }

            // Check if ALL tasks were completed before milestone end date
            $allCompletedOnTime = $internTasks->every(function ($task) use ($milestone) {
                return $task->status === TaskStatus::Completed
                    && $task->completed_at !== null
                    && $task->completed_at->lte($milestone->end_date);
            });

            if ($allCompletedOnTime) {
                return true;
            }
        }

        return false;
    }

    public function achievement(): Achievement
    {
        return Achievement::where('key', 'milestone_master')->firstOrFail();
    }
}