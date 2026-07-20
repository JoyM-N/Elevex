<?php

namespace App\Http\Controllers\Api\Intern;

use App\Http\Controllers\Controller;
use App\Enums\LogbookStatus;
use App\Enums\TaskStatus;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * DashboardController (Intern)
 *
 * Returns all data needed to render the intern dashboard
 * in a single API call.
 *
 * Scoped entirely to the authenticated intern —
 * they can only see their own data here.
 *
 * In Phase 10 these queries will be cached with Redis
 * per user so repeated loads don't hit the database.
 */
class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/v1/intern/dashboard
     * Returns aggregated data for the intern dashboard.
     */
    public function index(Request $request): JsonResponse
    {
        $intern = $request->user();

        // ── Task stats ────────────────────────────────────────
        $totalTasks     = $intern->tasks()->count();
        $completedTasks = $intern->tasks()
            ->where('status', TaskStatus::Completed)
            ->count();
        $inProgressTasks = $intern->tasks()
            ->where('status', TaskStatus::InProgress)
            ->count();
        $overdueTasks = $intern->tasks()
            ->whereNotIn('status', [
                TaskStatus::Completed->value,
                TaskStatus::Cancelled->value,
            ])
            ->whereNotNull('deadline')
            ->where('deadline', '<', now())
            ->count();

        // Tasks due in the next 7 days
        $upcomingDeadlines = $intern->tasks()
            ->whereNotIn('status', [
                TaskStatus::Completed->value,
                TaskStatus::Cancelled->value,
            ])
            ->whereNotNull('deadline')
            ->whereBetween('deadline', [now(), now()->addDays(7)])
            ->orderBy('deadline')
            ->take(5)
            ->get()
            ->map(fn($task) => [
                'id'       => $task->id,
                'title'    => $task->title,
                'deadline' => $task->deadline->toDateString(),
                'priority' => $task->priority->value,
                'status'   => $task->status->value,
            ]);

        // ── Logbook stats ─────────────────────────────────────
        $totalLogbooks    = $intern->logbooks()->count();
        $approvedLogbooks = $intern->logbooks()
            ->where('status', LogbookStatus::Approved)
            ->count();
        $draftLogbooks = $intern->logbooks()
            ->where('status', LogbookStatus::Draft)
            ->count();

        // Hours logged this week
        $hoursThisWeek = $intern->logbooks()
            ->whereBetween('date', [now()->startOfWeek(), now()->endOfWeek()])
            ->sum('hours_worked');

        // ── Performance ───────────────────────────────────────
        $latestMetric = $intern->performanceMetrics()->latest()->first();

        // ── Achievements ──────────────────────────────────────
        $achievements = $intern->achievements()
            ->latest('user_achievements.created_at')
            ->take(3)
            ->get()
            ->map(fn($achievement) => [
                'name'       => $achievement->name,
                'icon'       => $achievement->icon,
                'awarded_at' => $achievement->pivot->awarded_at,
            ]);

        // ── Active projects ───────────────────────────────────
        $activeProjects = $intern->projects()
            ->where('projects.status', 'active')
            ->withPivot('team_role')
            ->take(3)
            ->get()
            ->map(fn($project) => [
                'id'        => $project->id,
                'title'     => $project->title,
                'team_role' => $project->pivot->team_role,
                'end_date'  => $project->end_date->toDateString(),
            ]);

        return $this->success([
            'tasks' => [
                'total'       => $totalTasks,
                'completed'   => $completedTasks,
                'in_progress' => $inProgressTasks,
                'overdue'     => $overdueTasks,
                'completion_rate' => $totalTasks > 0
                    ? round(($completedTasks / $totalTasks) * 100, 2)
                    : 0,
            ],
            'logbooks' => [
                'total'    => $totalLogbooks,
                'approved' => $approvedLogbooks,
                'draft'    => $draftLogbooks,
                'hours_this_week' => round($hoursThisWeek, 2),
            ],
            'performance' => $latestMetric ? [
                'overall_score'    => $latestMetric->overall_score,
                'grade'            => $latestMetric->grade(),
                'completion_rate'  => $latestMetric->completion_rate,
                'deadline_score'   => $latestMetric->deadline_score,
                'consistency_score' => $latestMetric->consistency_score,
            ] : null,
            'recent_achievements'  => $achievements,
            'active_projects'      => $activeProjects,
            'upcoming_deadlines'   => $upcomingDeadlines,
        ], 'Intern dashboard retrieved successfully.');
    }
}