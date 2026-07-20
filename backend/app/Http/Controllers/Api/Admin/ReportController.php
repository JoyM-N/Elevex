<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Reports\ReportService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;

/**
 * ReportController (Admin)
 *
 * Generates and returns reports for admin review.
 * All report generation is delegated to ReportService.
 *
 * Reports are generated on demand — not stored in the database.
 * Each request generates a fresh PDF from current data.
 */
class ReportController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly ReportService $reportService
    ) {}

    /**
     * GET /api/v1/admin/reports/weekly
     * Generate a weekly report.
     *
     * Optional query param:
     *   week_start: date string for Monday of the week (defaults to last week)
     */
    public function weekly(Request $request): JsonResponse
    {
        $request->validate([
            'week_start' => ['nullable', 'date'],
        ]);

        $report = $this->reportService->generateWeeklyReport(
            weekStart: $request->query('week_start')
        );

        return $this->success($report, 'Weekly report generated successfully.');
    }

    /**
     * GET /api/v1/admin/reports/monthly
     * Generate a monthly report.
     *
     * Optional query params:
     *   year:  integer (defaults to last month's year)
     *   month: integer 1-12 (defaults to last month)
     */
    public function monthly(Request $request): JsonResponse
    {
        $request->validate([
            'year'  => ['nullable', 'integer', 'min:2020'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
        ]);

        $report = $this->reportService->generateMonthlyReport(
            year:  $request->integer('year')  ?: null,
            month: $request->integer('month') ?: null
        );

        return $this->success($report, 'Monthly report generated successfully.');
    }

    /**
     * GET /api/v1/admin/reports/performance/{user}
     * Generate a performance report for a specific intern.
     */
    public function performance(Request $request, int $userId): JsonResponse
    {
        $intern = User::findOrFail($userId);

        $report = $this->reportService->generatePerformanceReport($intern);

        return $this->success($report, 'Performance report generated successfully.');
    }
}