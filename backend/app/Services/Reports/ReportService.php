<?php

namespace App\Services\Reports;

use App\Services\Reports\Builders\MonthlyReportBuilder;
use App\Services\Reports\Builders\PerformanceReportBuilder;
use App\Services\Reports\Builders\WeeklyReportBuilder;
use App\Services\Reports\Exports\PdfExporter;
use App\Models\User;
use Carbon\Carbon;

/**
 * ReportService
 *
 * Orchestrates report generation.
 * Delegates data building to Builder classes
 * and PDF generation to PdfExporter.
 *
 * This service never builds data itself —
 * it only coordinates between builders and exporters.
 * Single Responsibility: orchestration only.
 *
 * Report types:
 *   weekly      — task and logbook stats for a specific week
 *   monthly     — comprehensive monthly overview
 *   performance — individual intern performance breakdown
 */
class ReportService
{
    public function __construct(
        private readonly WeeklyReportBuilder      $weeklyBuilder,
        private readonly MonthlyReportBuilder     $monthlyBuilder,
        private readonly PerformanceReportBuilder $performanceBuilder,
        private readonly PdfExporter              $pdfExporter
    ) {}

    /**
     * Generate a weekly report PDF.
     *
     * @param string|null $weekStart Date string for Monday of the week
     *                               Defaults to last Monday if not provided
     * @return array Report data + pdf_url for download
     */
    public function generateWeeklyReport(?string $weekStart = null): array
    {
        $start = $weekStart
            ? Carbon::parse($weekStart)->startOfWeek()
            : Carbon::now()->subWeek()->startOfWeek();

        // Build report data
        $data = $this->weeklyBuilder->build($start);

        // Generate PDF
        $pdfPath = $this->pdfExporter->generate(
            view: 'pdfs.reports.weekly',
            data: $data,
            folder: 'reports/weekly'
        );

        return [
            ...$data,
            'pdf_url' => asset('storage/' . $pdfPath),
        ];
    }

    /**
     * Generate a monthly report PDF.
     *
     * @param int|null $year  Defaults to last month's year
     * @param int|null $month Defaults to last month
     */
    public function generateMonthlyReport(?int $year = null, ?int $month = null): array
    {
        $year  = $year  ?? Carbon::now()->subMonth()->year;
        $month = $month ?? Carbon::now()->subMonth()->month;

        $data = $this->monthlyBuilder->build($year, $month);

        $pdfPath = $this->pdfExporter->generate(
            view: 'pdfs.reports.monthly',
            data: $data,
            folder: 'reports/monthly'
        );

        return [
            ...$data,
            'pdf_url' => asset('storage/' . $pdfPath),
        ];
    }

    /**
     * Generate a performance report PDF for a specific intern.
     */
    public function generatePerformanceReport(User $intern): array
    {
        $data = $this->performanceBuilder->build($intern);

        $pdfPath = $this->pdfExporter->generate(
            view: 'pdfs.reports.performance',
            data: $data,
            folder: 'reports/performance'
        );

        return [
            ...$data,
            'pdf_url' => asset('storage/' . $pdfPath),
        ];
    }
}