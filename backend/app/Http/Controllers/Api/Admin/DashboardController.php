<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Enums\LogbookStatus;
use App\Enums\ProjectStatus;
use App\Enums\TaskStatus;
use App\Models\Internship;
use App\Models\Logbook;
use App\Models\PerformanceMetric;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * DashboardController (Admin)
 *
 * Returns all data needed to render the admin dashboard
 * in a single API call.
 *
 * This prevents the frontend from making 8-10 separate
 * requests just to render one page — bad for performance
 * and bad for user experience.
 *
 * In Phase 10 these queries will be cached with Redis
 * so repeated dashboard loads don't hit the database.
 */
class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/v1/admin/dashboard
     * Returns aggregated data for the admin dashboard.
     */
    public function index(Request $request): JsonResponse
    {
        // ── Intern stats ──────────────────────────────────────
        $totalInterns  = User::where('role', 'intern')->count();
        $activeInterns = Internship::where('status', 'active')
            ->distinct('user_id')
            ->count('user_id');

        // ── Project stats ─────────────────────────────────────
        $projectsByStatus = Project::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $activeProjects = $projectsByStatus['active'] ?? 0;
        $totalProjects  = array_sum($projectsByStatus);

        // ── Task stats ────────────────────────────────────────
        $tasksDueThisWeek = Task::whereNotIn('status', [
                TaskStatus::Completed->value,
                TaskStatus::Cancelled->value,
            ])
            ->whereNotNull('deadline')
            ->whereBetween('deadline', [now()->startOfWeek(), now()->endOfWeek()])
            ->count();

        $overdueTasks = Task::whereNotIn('status', [
                TaskStatus::Completed->value,
                TaskStatus::Cancelled->value,
            ])
            ->whereNotNull('deadline')
            ->where('deadline', '<', now())
            ->count();

        // ── Logbook stats ─────────────────────────────────────
        $pendingLogbookReviews = Logbook::where('status', LogbookStatus::Submitted)->count();

        $logbooksApprovedToday = Logbook::where('status', LogbookStatus::Approved)
            ->whereDate('reviewed_at', today())
            ->count();

        // ── Top performer ─────────────────────────────────────
        $topPerformer = PerformanceMetric::with('user')
            ->orderByDesc('overall_score')
            ->first();

        // ── Recent activity ───────────────────────────────────
        // 5 most recently submitted logbooks waiting for review
        $pendingLogbooks = Logbook::with(['user', 'task'])
            ->where('status', LogbookStatus::Submitted)
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($logbook) => [
                'id'          => $logbook->id,
                'intern_name' => $logbook->user->name,
                'task_title'  => $logbook->task->title,
                'date'        => $logbook->date->toDateString(),
                'submitted_at' => $logbook->updated_at->toISOString(),
            ]);

        // 5 most recently created tasks
        $recentTasks = Task::with(['assignedTo'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($task) => [
                'id'           => $task->id,
                'title'        => $task->title,
                'status'       => $task->status->value,
                'assigned_to'  => $task->assignedTo->name,
                'deadline'     => $task->deadline?->toDateString(),
            ]);

        return $this->success([
            'interns' => [
                'total'  => $totalInterns,
                'active' => $activeInterns,
            ],
            'projects' => [
                'total'      => $totalProjects,
                'active'     => $activeProjects,
                'by_status'  => $projectsByStatus,
            ],
            'tasks' => [
                'due_this_week' => $tasksDueThisWeek,
                'overdue'       => $overdueTasks,
            ],
            'logbooks' => [
                'pending_review'    => $pendingLogbookReviews,
                'approved_today'    => $logbooksApprovedToday,
            ],
            'top_performer'   => $topPerformer ? [
                'name'          => $topPerformer->user->name,
                'overall_score' => $topPerformer->overall_score,
                'grade'         => $topPerformer->grade(),
            ] : null,
            'pending_logbooks' => $pendingLogbooks,
            'recent_tasks'     => $recentTasks,
        ], 'Admin dashboard retrieved successfully.');
    }
}