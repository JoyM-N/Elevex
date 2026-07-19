<?php

namespace App\Console\Commands;

use App\Services\PerformanceService;
use Illuminate\Console\Command;

/**
 * RecalculatePerformanceCommand
 *
 * Nightly scheduler command that recalculates performance
 * metrics for all interns.
 *
 * Registered in bootstrap/app.php scheduler.
 * Runs every night at midnight.
 *
 * Can also be run manually:
 *   php artisan performance:recalculate
 */
class RecalculatePerformanceCommand extends Command
{
    protected $signature   = 'performance:recalculate';
    protected $description = 'Recalculate performance metrics for all interns';

    public function handle(PerformanceService $performanceService): void
    {
        $this->info('Recalculating performance metrics...');

        $performanceService->recalculateAll();

        $this->info('Performance metrics recalculated successfully.');
    }
}