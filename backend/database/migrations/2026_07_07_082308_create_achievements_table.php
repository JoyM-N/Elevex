<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /**
         * Master achievements definition table.
         * Seeded — adding a new achievement means a new row here
         * plus a new AchievementRule class.
         */
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();

            // Machine-readable key used by AchievementService
            // e.g. 'perfect_attendance', 'fast_finisher'
            $table->string('key')->unique();

            // Human readable display name
            // e.g. 'Perfect Attendance', 'Fast Finisher'
            $table->string('name');

            $table->text('description');

            // Icon identifier for the frontend UI
            // e.g. 'calendar-check', 'zap', 'flame'
            $table->string('icon')->nullable();

            $table->timestamps();
        });

        /**
         * Records when each intern earned each achievement.
         * Each achievement can only be earned once per intern.
         */
        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('achievement_id')
                ->constrained('achievements')
                ->cascadeOnDelete();

            // When this achievement was awarded
            $table->timestamp('awarded_at');

            $table->timestamps();

            // Each achievement awarded once per intern
            $table->unique(['user_id', 'achievement_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');
    }
};