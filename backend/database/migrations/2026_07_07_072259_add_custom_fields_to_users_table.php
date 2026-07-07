<?php

use App\Enums\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {

            // Role stored as enum — fixed values enforced at DB level
            // Defaults to intern since most users created will be interns
            $table->enum('role', UserRole::values())
                ->default(UserRole::Intern->value)
                ->after('email');

            $table->string('phone', 20)
                ->nullable()
                ->after('role');

            $table->string('avatar_path')
                ->nullable()
                ->after('phone');

            // Soft disable — deactivate without deleting
            $table->boolean('is_active')
                ->default(true)
                ->after('avatar_path');

            $table->index('role');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['is_active']);
            $table->dropColumn(['role', 'phone', 'avatar_path', 'is_active']);
        });
    }
};