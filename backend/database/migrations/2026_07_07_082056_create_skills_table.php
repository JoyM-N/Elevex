<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /**
         * Master skills list.
         * Seeded by SkillSeeder — admins can extend it.
         */
        Schema::create('skills', function (Blueprint $table) {
            $table->id();

            // Skill name must be unique — no duplicate "Laravel" entries
            $table->string('name')->unique();

            // technical: Laravel, Docker, React etc.
            // soft: Communication, Leadership, Problem Solving etc.
            $table->enum('category', ['technical', 'soft'])
                ->default('technical');

            $table->timestamps();

            $table->index('category');
        });

        /**
         * Intern skill proficiency tracking.
         * One row per intern per skill.
         */
        Schema::create('user_skills', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('skill_id')
                ->constrained('skills')
                ->cascadeOnDelete();

            $table->enum('proficiency_level', [
                'beginner',
                'intermediate',
                'advanced',
                'expert',
            ])->default('beginner');

            // Admin who verified this proficiency level
            // Null means self-reported, not yet endorsed
            $table->foreignId('endorsed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('endorsed_at')->nullable();

            $table->timestamps();

            // An intern can only have one proficiency level per skill
            $table->unique(['user_id', 'skill_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_skills');
        Schema::dropIfExists('skills');
    }
};