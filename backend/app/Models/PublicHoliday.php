<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * PublicHoliday Model
 *
 * Represents a public holiday on which interns
 * are not expected to submit logbooks.
 *
 * Full admin management UI added in Phase 10.
 * Currently used by:
 *   PerfectAttendanceRule
 *   PerformanceService@calculateConsistencyScore
 */
class PublicHoliday extends Model
{
    protected $fillable = [
        'date',
        'name',
        'country',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }
}