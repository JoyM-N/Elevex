<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('milestones', function (Blueprint $table) {
            $table->id();

            $table->foreignId('project_id')
                ->constrained('projects')
                ->cascadeOnDelete(); 

            $table->string('title');
            $table->text('description')->nullable();

            $table->date('start_date');
            $table->date('end_date');

            $table->enum('status', ['pending', 'in_progress', 'completed'])
                ->default('pending');

            $table->timestamps();

            $table->index(['project_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('milestones');
    }
};