<?php

use App\Enums\InternshipStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internships', function (Blueprint $table) {
            $table->id();

            // The intern
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete(); // Never delete a user who has internship records

            // The admin supervising this internship
            $table->foreignId('supervisor_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('department');
            $table->string('university')->nullable();
            $table->string('student_id')->nullable(); // University student ID

            $table->date('start_date');
            $table->date('end_date');

            $table->enum('status', InternshipStatus::values())
                ->default(InternshipStatus::Active->value);

            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes(); // Safety net only — app layer prevents deletion

            // We filter by status and date range constantly
            $table->index('status');
            $table->index('start_date');
            $table->index('end_date');
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internships');
    }
};