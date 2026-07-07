<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();

            // The intern being evaluated
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // Which internship period this evaluation covers
            $table->foreignId('internship_id')
                ->constrained('internships')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // The admin writing this evaluation
            $table->foreignId('evaluated_by')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            /**
             * Qualitative dimensions scored 1-5.
             * These feed into the performance_metrics quality_score
             * and teamwork_score via the PerformanceService.
             */
            $table->unsignedTinyInteger('communication_score');
            $table->unsignedTinyInteger('professionalism_score');
            $table->unsignedTinyInteger('initiative_score');
            $table->unsignedTinyInteger('problem_solving_score');
            $table->unsignedTinyInteger('teamwork_score');

            // Admin's written remarks about the intern
            $table->text('remarks')->nullable();

            $table->timestamps();

            // One evaluation per intern per internship
            $table->unique(['user_id', 'internship_id']);
            $table->index('internship_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};