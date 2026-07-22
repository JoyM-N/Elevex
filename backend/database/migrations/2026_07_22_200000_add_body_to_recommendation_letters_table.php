<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recommendation_letters', function (Blueprint $table) {
            // Editable draft letter body (plain text). Generated from performance,
            // then polished by an admin before approval.
            $table->longText('body')->nullable()->after('admin_notes');
        });
    }

    public function down(): void
    {
        Schema::table('recommendation_letters', function (Blueprint $table) {
            $table->dropColumn('body');
        });
    }
};
