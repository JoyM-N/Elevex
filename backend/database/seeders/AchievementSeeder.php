<?php

namespace Database\Seeders;

use App\Models\Achievement;
use Illuminate\Database\Seeder;

/**
 * AchievementSeeder
 *
 * Seeds the master achievements list.
 * Uses firstOrCreate so running multiple times never creates duplicates.
 *
 * Adding a new achievement:
 *   1. Add a new entry here
 *   2. Create a corresponding AchievementRule class
 *   That's it — the system picks it up automatically.
 */
class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            [
                'key'         => 'perfect_attendance',
                'name'        => 'Perfect Attendance',
                'description' => 'Submitted logbooks every working day for a full month.',
                'icon'        => 'calendar-check',
            ],
            [
                'key'         => 'fast_finisher',
                'name'        => 'Fast Finisher',
                'description' => 'Completed 5 tasks ahead of their deadline.',
                'icon'        => 'zap',
            ],
            [
                'key'         => 'thirty_day_streak',
                'name'        => '30-Day Streak',
                'description' => 'Maintained 30 consecutive days of logbook submissions.',
                'icon'        => 'flame',
            ],
            [
                'key'         => 'team_player',
                'name'        => 'Team Player',
                'description' => 'Contributed to 3 or more projects simultaneously.',
                'icon'        => 'users',
            ],
            [
                'key'         => 'top_performer',
                'name'        => 'Top Performer',
                'description' => 'Achieved an overall performance score above 90%.',
                'icon'        => 'trophy',
            ],
            [
                'key'         => 'milestone_master',
                'name'        => 'Milestone Master',
                'description' => 'Completed all tasks in a milestone before the due date.',
                'icon'        => 'flag',
            ],
            [
                'key'         => 'consistency_champion',
                'name'        => 'Consistency Champion',
                'description' => 'Maintained a logbook consistency score above 95% for a full internship.',
                'icon'        => 'bar-chart',
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::firstOrCreate(
                ['key' => $achievement['key']],
                $achievement
            );
        }

        $this->command->info('Achievements seeded: ' . count($achievements) . ' achievements.');
    }
}