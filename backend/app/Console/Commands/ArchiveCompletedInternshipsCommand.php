<?php

namespace App\Console\Commands;

use App\Enums\InternshipStatus;
use App\Models\Internship;
use Illuminate\Console\Command;

/**
 * ArchiveCompletedInternshipsCommand
 *
 * Automatically archives internships where the end_date
 * has passed and status is still 'completed'.
 *
 * Archived internships are read-only historical records.
 * They no longer appear in active dashboards but are
 * preserved for reports and recommendation letters.
 *
 * Schedule: daily at 2am
 *
 * Manual run:
 *   php artisan internships:archive
 */
class ArchiveCompletedInternshipsCommand extends Command
{
    protected $signature   = 'internships:archive';
    protected $description = 'Archive completed internships past their end date';

    public function handle(): void
    {
        $this->info('Archiving completed internships...');

        $count = Internship::where('status', InternshipStatus::Completed)
            ->where('end_date', '<', now()->subDays(30))
            ->update(['status' => InternshipStatus::Archived]);

        $this->info("Archived {$count} internship(s).");
    }
}