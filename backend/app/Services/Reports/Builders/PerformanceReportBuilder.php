<?php

namespace App\Services\Reports\Builders;

use App\Models\PerformanceMetric;
use App\Models\User;

/**
 * PerformanceReportBuilder
 *
 * Builds the data structure for an individual intern
 * performance report.
 *
 * Used for:
 *   - Admin reviewing a specific intern's full performance
 *   - Intern's own portfolio performance view
 *   - Attached to recommendation letters as supporting data
 *
 * Includes full breakdown of all metric components
 * so the reader understands exactly how the score was derived.
 */
class PerformanceReportBuilder
{
    /**
     * Build a full performance report for a specific intern.
     */
    public function build(User $intern): array
    {
        // Get latest performance metrics
        $metric = PerformanceMetric::where('user_id', $intern->id)
            ->with(['internship'])
            ->latest('calculated_at')
            ->first();

        // Get all achievements earned
        $achievements = $intern->achievements()->get();

        // Get all skills with proficiency levels
        $skills = $intern->skills()->get();

        // Task completion breakdown
        $taskStats = [
            'total'      => $intern->tasks()->count(),
            'completed'  => $intern->tasks()->where('status', 'completed')->count(),
            'in_progress' => $intern->tasks()->where('status', 'in_progress')->count(),
            'overdue'    => $intern->tasks()
                ->whereNotIn('status', ['completed', 'cancelled'])
                ->whereNotNull('deadline')
                ->where('deadline', '<', now())
                ->count(),
        ];

        // Logbook submission breakdown
        $logbookStats = [
            'total'    => $intern->logbooks()->count(),
            'approved' => $intern->logbooks()->where('status', 'approved')->count(),
            'pending'  => $intern->logbooks()->where('status', 'submitted')->count(),
            'draft'    => $intern->logbooks()->where('status', 'draft')->count(),
        ];

        // Project contributions
        $projects = $intern->projects()->with('milestones')->get();

        return [
            'intern'       => $intern,
            'metric'       => $metric,
            'grade'        => $metric?->grade() ?? 'Not yet calculated',
            'task_stats'   => $taskStats,
            'logbook_stats' => $logbookStats,
            'projects'     => $projects,
            'achievements' => $achievements,
            'skills'       => $skills,
            'generated_at' => now()->toISOString(),
        ];
    }
}