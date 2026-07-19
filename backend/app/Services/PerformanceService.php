<?php

namespace App\Services;

use App\Enums\LogbookStatus;
use App\Enums\TaskStatus;
use App\Models\Internship;
use App\Models\PerformanceMetric;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * PerformanceService
 *
 * Calculates and stores performance metrics for interns.
 *
 * Performance Formula:
 *   completion_rate   × 40% — tasks completed vs total assigned
 *   deadline_score    × 20% — tasks completed on time vs total
 *   consistency_score × 15% — logbook submission regularity
 *   quality_score     × 15% — from admin evaluation average score
 *   teamwork_score    × 10% — from admin evaluation teamwork score
 *   ─────────────────────────────────────────────────────────────
 *   overall_score          — weighted sum of all above
 *
 * Consistency score accounts for:
 *   - Weekends (excluded — not required)
 *   - Public holidays (excluded — not required)
 *   - Approved sick days (excluded — not penalized)
 *
 * This service is called by:
 *   - RecalculatePerformanceCommand (nightly scheduler at midnight)
 *   - EvaluationController after evaluation is submitted
 *   - Phase 10: TaskCompleted event listener
 *   - Phase 10: LogbookApproved event listener
 */
class PerformanceService
{
    /**
     * Calculate and store performance metrics for a specific intern
     * using their most recent internship.
     *
     * Uses updateOrCreate so running multiple times never creates
     * duplicate records — it always updates the existing one.
     *
     * Returns null if the intern has no internship on record.
     */
    public function calculate(User $intern): ?PerformanceMetric
    {
        // Get the intern's most recent internship
        $internship = Internship::where('user_id', $intern->id)
            ->latest()
            ->first();

        if (!$internship) {
            return null;
        }

        $completionRate   = $this->calculateCompletionRate($intern);
        $deadlineScore    = $this->calculateDeadlineScore($intern);
        $consistencyScore = $this->calculateConsistencyScore($intern, $internship);
        $qualityScore     = $this->calculateQualityScore($intern, $internship);
        $teamworkScore    = $this->calculateTeamworkScore($intern, $internship);

        // Weighted overall score — must match the formula documented above
        $overallScore = round(
            ($completionRate   * 0.40) +
            ($deadlineScore    * 0.20) +
            ($consistencyScore * 0.15) +
            ($qualityScore     * 0.15) +
            ($teamworkScore    * 0.10),
            2
        );

        // updateOrCreate — never duplicates, always updates existing record
        return PerformanceMetric::updateOrCreate(
            [
                'user_id'       => $intern->id,
                'internship_id' => $internship->id,
            ],
            [
                'completion_rate'   => $completionRate,
                'deadline_score'    => $deadlineScore,
                'consistency_score' => $consistencyScore,
                'quality_score'     => $qualityScore,
                'teamwork_score'    => $teamworkScore,
                'overall_score'     => $overallScore,
                'calculated_at'     => now(),
            ]
        );
    }

    /**
     * Recalculate metrics for ALL interns who have internships.
     * Called by RecalculatePerformanceCommand every night at midnight.
     */
    public function recalculateAll(): void
    {
        $interns = User::whereHas('internships')->get();

        foreach ($interns as $intern) {
            $this->calculate($intern);
        }
    }

    /**
     * Completion Rate (40% weight)
     *
     * Formula: completed tasks / total assigned tasks × 100
     *
     * Returns 0 if no tasks have been assigned yet.
     * This prevents division by zero and gives a fair
     * starting point for new interns.
     */
    private function calculateCompletionRate(User $intern): float
    {
        $total     = $intern->tasks()->count();
        $completed = $intern->tasks()
            ->where('status', TaskStatus::Completed)
            ->count();

        if ($total === 0) {
            return 0;
        }

        return round(($completed / $total) * 100, 2);
    }

    /**
     * Deadline Score (20% weight)
     *
     * Formula: tasks completed on or before deadline /
     *          total completed tasks with deadlines × 100
     *
     * Only considers completed tasks that have both
     * a deadline and a completed_at timestamp.
     * Tasks without deadlines are excluded — they cannot
     * be judged for deadline adherence.
     */
    private function calculateDeadlineScore(User $intern): float
    {
        $completedWithDeadline = $intern->tasks()
            ->where('status', TaskStatus::Completed)
            ->whereNotNull('deadline')
            ->whereNotNull('completed_at')
            ->count();

        if ($completedWithDeadline === 0) {
            return 0;
        }

        $onTime = $intern->tasks()
            ->where('status', TaskStatus::Completed)
            ->whereNotNull('deadline')
            ->whereNotNull('completed_at')
            ->whereColumn('completed_at', '<=', 'deadline')
            ->count();

        return round(($onTime / $completedWithDeadline) * 100, 2);
    }

    /**
     * Consistency Score (15% weight)
     *
     * Formula: approved logbooks / required working days × 100
     *
     * Required working days excludes:
     *   - Weekends (Saturday and Sunday)
     *   - Public holidays (stored in public_holidays table)
     *   - Approved sick days for this specific intern
     *
     * Capped at 100 — an intern cannot score above perfect
     * even if they submit multiple logbooks per day.
     *
     * Phase 10 adds:
     *   - Admin UI to manage public holidays
     *   - Intern sick day request + admin approval flow
     */
    private function calculateConsistencyScore(User $intern, Internship $internship): float
    {
        $startDate = $internship->start_date;

        // Use today if internship hasn't ended yet
        // Use end_date if internship is already completed
        $endDate = now()->lt($internship->end_date)
            ? now()
            : $internship->end_date;

        // Fetch public holiday dates in this internship period
        $publicHolidays = DB::table('public_holidays')
            ->whereBetween('date', [$startDate, $endDate])
            ->pluck('date')
            ->map(fn($date) => Carbon::parse($date)->toDateString())
            ->toArray();

        // Fetch approved sick days for this intern in this period
        $approvedSickDays = DB::table('sick_days')
            ->where('user_id', $intern->id)
            ->where('status', 'approved')
            ->whereBetween('date', [$startDate, $endDate])
            ->pluck('date')
            ->map(fn($date) => Carbon::parse($date)->toDateString())
            ->toArray();

        // Count required working days
        $requiredDays = 0;
        $current      = $startDate->copy();

        while ($current->lte($endDate)) {
            $dateString = $current->toDateString();

            $isWeekend  = $current->isWeekend();
            $isHoliday  = in_array($dateString, $publicHolidays);
            $isSickDay  = in_array($dateString, $approvedSickDays);

            // Only count days where attendance was actually required
            if (!$isWeekend && !$isHoliday && !$isSickDay) {
                $requiredDays++;
            }

            $current->addDay();
        }

        if ($requiredDays === 0) {
            return 0;
        }

        // Count approved logbooks submitted during this period
        $approvedLogbooks = $intern->logbooks()
            ->where('status', LogbookStatus::Approved)
            ->whereBetween('date', [$startDate, $endDate])
            ->count();

        // Cap at 100 — can't score above perfect attendance
        return min(round(($approvedLogbooks / $requiredDays) * 100, 2), 100);
    }

    /**
     * Quality Score (15% weight)
     *
     * Derived from the admin's evaluation average score.
     * Converts the 1-5 scale to a 0-100 percentage using
     * the averageScoreAsPercentage() method on Evaluation model.
     *
     * Returns 0 if no evaluation has been submitted yet.
     * Score will update automatically when admin submits evaluation
     * since EvaluationController calls calculate() after saving.
     */
    private function calculateQualityScore(User $intern, Internship $internship): float
    {
        // Load evaluation relationship if not already loaded
        $evaluation = $internship->evaluation;

        if (!$evaluation) {
            return 0;
        }

        return $evaluation->averageScoreAsPercentage();
    }

    /**
     * Teamwork Score (10% weight)
     *
     * Derived specifically from the teamwork_score dimension
     * of the admin's evaluation.
     * Converts the 1-5 scale to a 0-100 percentage.
     *
     * Returns 0 if no evaluation has been submitted yet.
     */
    private function calculateTeamworkScore(User $intern, Internship $internship): float
    {
        $evaluation = $internship->evaluation;

        if (!$evaluation) {
            return 0;
        }

        return $evaluation->teamworkScoreAsPercentage();
    }
}