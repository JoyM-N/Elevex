<?php

namespace App\Console\Commands;

use App\Enums\TaskStatus;
use App\Models\Task;
use Illuminate\Console\Command;

/**
 * UpdateOverdueTasksCommand
 *
 * Runs daily to flag tasks that have passed their deadline
 * without being completed.
 *
 * Currently just logs overdue tasks.
 * Phase 11 enhancement: send notifications to interns
 * and their supervisors when tasks become overdue.
 *
 * Schedule: daily at 6am — start of working day
 *
 * Manual run:
 *   php artisan tasks:update-overdue
 */
class UpdateOverdueTasksCommand extends Command
{
    protected $signature   = 'tasks:update-overdue';
    protected $description = 'Flag tasks that have passed their deadline';

    public function handle(): void
    {
        $overdueTasks = Task::whereNotIn('status', [
                TaskStatus::Completed->value,
                TaskStatus::Cancelled->value,
            ])
            ->whereNotNull('deadline')
            ->where('deadline', '<', now())
            ->with(['assignedTo'])
            ->get();

        if ($overdueTasks->isEmpty()) {
            $this->info('No overdue tasks found.');
            return;
        }

        $this->warn("Found {$overdueTasks->count()} overdue tasks:");

        foreach ($overdueTasks as $task) {
            $this->line("  - [{$task->id}] {$task->title} — assigned to {$task->assignedTo->name}");
        }

        $this->info('Overdue task check complete.');
    }
}