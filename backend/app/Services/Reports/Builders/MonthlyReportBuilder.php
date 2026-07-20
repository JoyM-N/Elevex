<?php

namespace App\Services\Reports\Builders;

use App\Enums\LogbookStatus;
use App\Enums\TaskStatus;
use App\Models\Logbook;
use App\Models\PerformanceMetric;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;

/**
 * MonthlyReportBuilder
 *
 * Builds the data structure for a monthly report.
 *
 * A monthly report covers a full calendar month and includes:
 *   - Project progress overview
 *   - Task completion statistics
 *   - Logbook submission rates
 *   - Top performing interns
 *   - Hours worked breakdown
 *   - Per-intern performance summary
 *
 * More comprehensive than the weekly report —
 * used for management review and record keeping.
 */
class MonthlyReportBuilder
{
    /**
     * Build the monthly report data for a given month.
     *
     * @param int $year  e.g. 2026
     * @param int $month e.g. 7
     */
    public function build(int $year, int $month): array
    {
        $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endOfMonth   = $startOfMonth->copy()->endOfMonth();

        // Project stats
        $activeProjects    = Project::where('status', 'active')->count();
        $completedProjects = Project::where('status', 'completed')
            ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
            ->count();

        // Task stats for this month
        $totalTasks     = Task::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $completedTasks = Task::where('status', TaskStatus::Completed)
            ->whereBetween('completed_at', [$startOfMonth, $endOfMonth])
            ->count();
        $overdueTasks   = Task::whereNotIn('status', [
                TaskStatus::Completed->value,
                TaskStatus::Cancelled->value,
            ])
            ->whereNotNull('deadline')
            ->where('deadline', '<', $endOfMonth)
            ->count();

        // Logbook stats for this month
        $totalLogbooks    = Logbook::whereBetween('date', [$startOfMonth, $endOfMonth])->count();
        $approvedLogbooks = Logbook::where('status', LogbookStatus::Approved)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->count();
        $totalHours = Logbook::whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('hours_worked');

        // Top 5 performing interns by overall score
        $topPerformers = PerformanceMetric::with('user')
            ->orderByDesc('overall_score')
            ->take(5)
            ->get();

        // Per-intern breakdown for this month
        $interns = User::where('role', 'intern')
            ->with('performanceMetrics')
            ->withCount([
                'tasks as tasks_this_month' => fn($q) =>
                    $q->whereBetween('created_at', [$startOfMonth, $endOfMonth]),
                'logbooks as logbooks_this_month' => fn($q) =>
                    $q->whereBetween('date', [$startOfMonth, $endOfMonth]),
            ])
            ->get();

        return [
            'period' => [
                'year'  => $year,
                'month' => $month,
                'label' => $startOfMonth->format('F Y'),
                'start' => $startOfMonth->toDateString(),
                'end'   => $endOfMonth->toDateString(),
            ],
            'projects' => [
                'active'    => $activeProjects,
                'completed' => $completedProjects,
            ],
            'tasks' => [
                'total'     => $totalTasks,
                'completed' => $completedTasks,
                'overdue'   => $overdueTasks,
                'completion_rate' => $totalTasks > 0
                    ? round(($completedTasks / $totalTasks) * 100, 2)
                    : 0,
            ],
            'logbooks' => [
                'total'    => $totalLogbooks,
                'approved' => $approvedLogbooks,
                'approval_rate' => $totalLogbooks > 0
                    ? round(($approvedLogbooks / $totalLogbooks) * 100, 2)
                    : 0,
                'total_hours' => round($totalHours, 2),
            ],
            'top_performers' => $topPerformers,
            'interns'        => $interns,
            'generated_at'   => now()->toISOString(),
        ];
    }
}