<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();

            // Who performed this action
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // What happened — e.g. 'logbook.approved', 'task.completed'
            $table->string('event');

            // Human readable description
            // e.g. "Admin Joy approved John's logbook for Task #5"
            $table->string('description');

            /**
             * nullableMorphs() creates:
             *   subject_id   (unsignedBigInteger, nullable)
             *   subject_type (string, nullable)
             * Nullable because some events have no subject
             * e.g. 'auth.login' has no specific resource attached
             */
            $table->nullableMorphs('subject');

            // Extra context stored as JSON
            // e.g. status changes, before/after values
            $table->json('metadata')->nullable();

            // IP address of the request that triggered this event
            $table->string('ip_address', 45)->nullable();

            // Only created_at — logs are immutable, never updated
            $table->timestamp('created_at');

            // Frequently queried columns
            $table->index('user_id');
            $table->index('event');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};