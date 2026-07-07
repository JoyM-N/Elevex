<?php

use App\Enums\LogbookStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logbooks', function (Blueprint $table) {
            $table->id();

            // The intern submitting this logbook
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // Which task this logbook entry is about
            $table->foreignId('task_id')
                ->constrained('tasks')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // The admin who reviewed this — null until reviewed
            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // The date the work was done — not when it was submitted
            $table->date('date');

            // Stored as decimal to support half hours e.g. 2.5 hours
            $table->decimal('hours_worked', 4, 2);

            $table->text('description');
            $table->text('blockers')->nullable();
            $table->text('learning_outcome')->nullable();

            $table->enum('status', LogbookStatus::values())
                ->default(LogbookStatus::Draft->value);

            // Admin feedback when rejecting or requesting revision
            $table->text('revision_note')->nullable();

            // When the admin took action on this logbook
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();

            // Frequently queried combinations
            $table->index('user_id');
            $table->index('status');
            $table->index('date');
            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logbooks');
    }
};