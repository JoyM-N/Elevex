<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sick Days Table
 *
 * Tracks intern sick day requests with optional medical proof.
 * Approved sick days are excluded from attendance calculations
 * so interns are not penalized for genuine illness.
 *
 * Status flow:
 *   pending  — intern submitted request, waiting for admin
 *   approved — admin verified, excluded from attendance calc
 *   rejected — admin rejected, counts against attendance
 *
 * Full implementation in Phase 10:
 *   - Intern sick day request endpoint
 *   - Admin approval/rejection endpoint
 *   - Notification to intern when admin takes action
 *   - File upload for medical proof document
 *
 * Used by:
 *   PerfectAttendanceRule  — excludes approved sick days
 *   PerformanceService     — excludes approved sick days
 *                            from consistency score
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sick_days', function (Blueprint $table) {
            $table->id();

            // The intern who is sick
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // The date they were sick
            $table->date('date');

            // Brief reason for absence
            $table->string('reason')->nullable();

            // Path to uploaded medical document
            // Stored like other file uploads — path only, not contents
            $table->string('proof_path')->nullable();

            // Admin who reviewed this request
            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->enum('status', ['pending', 'approved', 'rejected'])
                ->default('pending');

            // When admin took action
            $table->timestamp('approved_at')->nullable();

            // Admin notes — e.g. reason for rejection
            $table->text('admin_notes')->nullable();

            $table->timestamps();

            // One sick day request per intern per date
            $table->unique(['user_id', 'date']);

            $table->index(['user_id', 'status']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sick_days');
    }
};