<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Public Holidays Table
 *
 * Stores public holidays so the performance engine
 * does not penalize interns for not submitting logbooks
 * on non-working public holidays.
 *
 * Full implementation in Phase 10:
 *   - Admin UI to manage holidays
 *   - Seeded with Kenyan public holidays by default
 *
 * Used by:
 *   PerfectAttendanceRule  — excludes holidays from working days count
 *   PerformanceService     — excludes holidays from consistency score
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('public_holidays', function (Blueprint $table) {
            $table->id();

            // The actual holiday date
            $table->date('date')->unique();

            // e.g. "Madaraka Day", "Christmas Day"
            $table->string('name');

            // Country code — defaults to KE (Kenya)
            // Allows future multi-country support
            $table->string('country', 2)->default('KE');

            $table->timestamps();

            $table->index('date');
            $table->index('country');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('public_holidays');
    }
};