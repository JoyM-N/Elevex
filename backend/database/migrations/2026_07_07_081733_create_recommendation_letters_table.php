<?php

use App\Enums\RecommendationStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recommendation_letters', function (Blueprint $table) {
            $table->id();

            // The intern requesting the letter
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // Which internship this letter is for
            $table->foreignId('internship_id')
                ->constrained('internships')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // The admin who approved — null until approved
            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->enum('status', RecommendationStatus::values())
                ->default(RecommendationStatus::Pending->value);

            // Path to the generated PDF — null until generated
            $table->string('pdf_path')->nullable();

            // When the PDF was generated
            $table->timestamp('generated_at')->nullable();

            // When the admin approved the request
            $table->timestamp('approved_at')->nullable();

            // Internal admin notes — never shown in the letter itself
            $table->text('admin_notes')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('internship_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recommendation_letters');
    }
};