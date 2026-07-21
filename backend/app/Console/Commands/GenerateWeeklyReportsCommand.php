<?php

namespace App\Console\Commands;

use App\Services\Reports\ReportService;
use Illuminate\Console\Command;

/**
 * GenerateWeeklyReportsCommand
 *
 * Automatically generates the weekly report every Monday morning.
 * The report covers the previous week (Mon-Sun).
 *
 * Schedule: every Monday at 7am
 *
 * Manual run:
 *   php artisan reports:weekly
 */
class GenerateWeeklyReportsCommand extends Command
{
    protected $signature   = 'reports:weekly';
    protected $description = 'Generate weekly report for the previous week';

    public function handle(ReportService $reportService): void
    {
        $this->info('Generating weekly report...');

        $report = $reportService->generateWeeklyReport();

        $this->info("Weekly report generated successfully.");
        $this->info("PDF available at: {$report['pdf_url']}");
    }
}