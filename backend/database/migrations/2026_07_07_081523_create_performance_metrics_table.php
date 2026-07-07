<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('performance_metrics', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('internship_id')
                ->constrained('internships')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            /**
             * All scores are percentages: 0.00 to 100.00
             * decimal(5,2) means up to 999.99 but we cap at 100.00
             * in the PerformanceService before saving.
             */
            $table->decimal('completion_rate', 5, 2)->default(0);
            $table->decimal('deadline_score', 5, 2)->default(0);
            $table->decimal('consistency_score', 5, 2)->default(0);
            $table->decimal('quality_score', 5, 2)->default(0);
            $table->decimal('teamwork_score', 5, 2)->default(0);

            // The final weighted composite score
            $table->decimal('overall_score', 5, 2)->default(0);

            // When PerformanceService last calculated these scores
            $table->timestamp('calculated_at');

            $table->timestamps();

            // One metrics record per intern per internship
            $table->unique(['user_id', 'internship_id']);

            // Used for leaderboard and top performer queries
            $table->index(['user_id', 'overall_score']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_metrics');
    }
};