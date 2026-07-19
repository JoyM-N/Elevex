<?php

namespace App\Rules\Achievements;

use App\Contracts\AchievementRule;
use App\Models\Achievement;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * PerfectAttendanceRule
 *
 * Awards "Perfect Attendance" when an intern has submitted
 * at least one logbook for every required working day
 * in the last calendar month.
 *
 * A day is NOT required if:
 *   - It falls on a weekend (Saturday or Sunday)
 *   - It is a public holiday (in public_holidays table)
 *   - The intern has an approved sick day for that date
 *
 * Phase 10 will add:
 *   - Admin UI to manage public holidays
 *   - Intern sick day request + admin approval flow
 *   - Notification when sick day is approved/rejected
 */
class PerfectAttendanceRule implements AchievementRule
{
    public function evaluate(User $user): bool
    {
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $endOfLastMonth   = Carbon::now()->subMonth()->endOfMonth();

        // Get all public holiday dates in this period
        $publicHolidays = DB::table('public_holidays')
            ->whereBetween('date', [$startOfLastMonth, $endOfLastMonth])
            ->pluck('date')
            ->map(fn($date) => Carbon::parse($date)->toDateString())
            ->toArray();

        // Get all approved sick day dates for this intern in this period
        $approvedSickDays = DB::table('sick_days')
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->whereBetween('date', [$startOfLastMonth, $endOfLastMonth])
            ->pluck('date')
            ->map(fn($date) => Carbon::parse($date)->toDateString())
            ->toArray();

        // Count required working days
        // Excludes weekends, public holidays and approved sick days
        $requiredDays = 0;
        $current      = $startOfLastMonth->copy();

        while ($current->lte($endOfLastMonth)) {
            $dateString = $current->toDateString();

            $isWeekend       = $current->isWeekend();
            $isHoliday       = in_array($dateString, $publicHolidays);
            $isSickDay       = in_array($dateString, $approvedSickDays);

            if (!$isWeekend && !$isHoliday && !$isSickDay) {
                $requiredDays++;
            }

            $current->addDay();
        }

        if ($requiredDays === 0) {
            return false;
        }

        // Count distinct logbook days submitted in this period
        $logbookDays = $user->logbooks()
            ->whereBetween('date', [$startOfLastMonth, $endOfLastMonth])
            ->distinct('date')
            ->count('date');

        return $logbookDays >= $requiredDays;
    }

    public function achievement(): Achievement
    {
        return Achievement::where('key', 'perfect_attendance')->firstOrFail();
    }
}