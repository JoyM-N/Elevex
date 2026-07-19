<?php

namespace App\Console\Commands;

use App\Services\AchievementService;
use Illuminate\Console\Command;

/**
 * CheckAchievementsCommand
 *
 * Nightly scheduler command that evaluates achievement
 * rules for all interns and awards any newly earned ones.
 *
 * Registered in bootstrap/app.php scheduler.
 * Runs every night at 1am (after performance recalculation).
 *
 * Can also be run manually:
 *   php artisan achievements:check
 */
class CheckAchievementsCommand extends Command
{
    protected $signature   = 'achievements:check';
    protected $description = 'Check and award achievements for all interns';

    public function handle(AchievementService $achievementService): void
    {
        $this->info('Checking achievements for all interns...');

        $achievementService->evaluateForAll();

        $this->info('Achievement check completed.');
    }
}