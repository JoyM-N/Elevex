<?php

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->text('description')->nullable();

            $table->enum('status', ProjectStatus::values())
                ->default(ProjectStatus::Planning->value);

            $table->enum('priority', ProjectPriority::values())
                ->default(ProjectPriority::Medium->value);

            $table->date('start_date');
            $table->date('end_date');

            // The admin who created this project
            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('priority');
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};