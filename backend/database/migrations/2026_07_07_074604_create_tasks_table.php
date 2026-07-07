<?php

use App\Enums\ProjectPriority;
use App\Enums\TaskStatus;
use App\Enums\TaskType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('milestone_id')
                ->nullable()
                ->constrained('milestones')
                ->cascadeOnDelete();

            $table->foreignId('assigned_to')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            $table->enum('task_type', TaskType::values())
                ->default(TaskType::ProjectTask->value);

            $table->enum('status', TaskStatus::values())
                ->default(TaskStatus::Todo->value);

            $table->enum('priority', ProjectPriority::values())
                ->default(ProjectPriority::Medium->value);

            // Stored as decimal to support half hours e.g. 1.5 hours
            $table->decimal('estimated_hours', 5, 2)->nullable();
            $table->decimal('actual_hours', 5, 2)->nullable();
            $table->date('deadline')->nullable();

            $table->timestamp('completed_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('assigned_to');
            $table->index('status');
            $table->index('task_type');
            $table->index('deadline');
            $table->index(['assigned_to', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};