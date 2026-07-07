<?php

use App\Enums\TeamRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_members', function (Blueprint $table) {
            $table->id();

            $table->foreignId('project_id')
                ->constrained('projects')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // The role this intern plays specifically on this project
            $table->enum('team_role', TeamRole::values());

            $table->timestamps();

            // An intern can only be a member of a project once.This prevents duplicate membership rows

            $table->unique(['project_id', 'user_id']);

            $table->index('user_id');
            $table->index('project_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_members');
    }
};