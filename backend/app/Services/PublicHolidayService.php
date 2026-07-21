<?php

namespace App\Services;

use App\Models\PublicHoliday;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * PublicHolidayService
 *
 * Manages the public holidays list.
 *
 * Public holidays are excluded from:
 *   PerfectAttendanceRule — achievement check
 *   PerformanceService    — consistency score calculation
 *
 * Seeded with Kenyan public holidays by PublicHolidaySeeder.
 * Admins can add, update, or remove holidays via the UI.
 */
class PublicHolidayService
{
    /**
     * Get all public holidays.
     * Ordered by date ascending.
     */
    public function getAllHolidays(int $year = null): Collection
    {
        return PublicHoliday::query()
            ->when($year, fn($q) => $q->whereYear('date', $year))
            ->orderBy('date')
            ->get();
    }

    /**
     * Create a new public holiday.
     */
    public function createHoliday(array $data): PublicHoliday
    {
        return PublicHoliday::create($data);
    }

    /**
     * Update a public holiday.
     *
     * @throws ModelNotFoundException
     */
    public function updateHoliday(int $id, array $data): PublicHoliday
    {
        $holiday = PublicHoliday::findOrFail($id);
        $holiday->update($data);

        return $holiday->fresh();
    }

    /**
     * Delete a public holiday.
     *
     * @throws ModelNotFoundException
     */
    public function deleteHoliday(int $id): void
    {
        PublicHoliday::findOrFail($id)->delete();
    }
}