<?php

namespace App\Services\Reports\Builders;

use App\Enums\LogbookStatus;
use App\Enums\TaskStatus;
use App\Models\Logbook;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;

/**
 * WeeklyReportBuilder
 *
 * Builds the data structure for a weekly report.
 *
 * A weekly report covers Monday to Sunday of a given week
 * and includes:
 *   - Total tasks assigned, completed, overdue
 *   - Total logbooks submitted and approved
 *   - Hours worked across all interns
 *   - Per-intern breakdown
 *
 * ReportService calls build() and passes the result
 * to PdfExporter to generate the PDF.
 */
class WeeklyReportBuilder
{
    /**
     * Build the weekly report data for a given week.
     *
     * @param Carbon $weekStart Monday of the week to report on
     */
    public function build(Carbon $weekStart): array
    {
        $weekEnd = $weekStart->copy()->endOfWeek();

        // System-wide task stats for this week
        $totalTasks     = Task::whereBetween('created_at', [$weekStart, $weekEnd])->count();
        $completedTasks = Task::where('status', TaskStatus::Completed)
            ->whereBetween('completed_at', [$weekStart, $weekEnd])
            ->count();
        $overdueTasks   = Task::whereNotIn('status', [
                TaskStatus::Completed->value,
                TaskStatus::Cancelled->value,
            ])
            ->whereNotNull('deadline')
            ->where('deadline', '<', now())
            ->count();

        // Logbook stats for this week
        $totalLogbooks    = Logbook::whereBetween('date', [$weekStart, $weekEnd])->count();
        $approvedLogbooks = Logbook::where('status', LogbookStatus::Approved)
            ->whereBetween('date', [$weekStart, $weekEnd])
            ->count();
        $totalHours = Logbook::whereBetween('date', [$weekStart, $weekEnd])
            ->sum('hours_worked');

        // Per-intern breakdown
        $interns = User::where('role', 'intern')
            ->withCount([
                'tasks as tasks_this_week' => fn($q) =>
                    $q->whereBetween('created_at', [$weekStart, $weekEnd]),
                'logbooks as logbooks_this_week' => fn($q) =>
                    $q->whereBetween('date', [$weekStart, $weekEnd]),
            ])
            ->get();

        return [
            'period'      => [
                'start' => $weekStart->toDateString(),
                'end'   => $weekEnd->toDateString(),
                'label' => 'Week of ' . $weekStart->format('M d, Y'),
            ],
            'summary'     => [
                'total_tasks'      => $totalTasks,
                'completed_tasks'  => $completedTasks,
                'overdue_tasks'    => $overdueTasks,
                'total_logbooks'   => $totalLogbooks,
                'approved_logbooks' => $approvedLogbooks,
                'total_hours'      => round($totalHours, 2),
            ],
            'interns'     => $interns,
            'generated_at' => now()->toISOString(),
        ];
    }
}