<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('file_uploads', function (Blueprint $table) {
            $table->id();

            // Who uploaded this file
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            /**
             * morphs() creates:
             *   uploadable_id   (unsignedBigInteger)
             *   uploadable_type (string)
             * Plus a combined index on both.
             */
            $table->morphs('uploadable');

            // Original filename — shown to the user in the UI
            $table->string('original_name');

            // UUID-based name we assign — prevents conflicts and enumeration attacks
            $table->string('stored_name');

            // Relative path inside storage disk
            $table->string('path');

            // e.g. image/png, application/pdf
            $table->string('mime_type', 100);

            // File size in bytes — used for storage quota checks
            $table->unsignedBigInteger('size');

            // 'public' for local storage, 's3' for production
            // Designed to make storage migration seamless
            $table->string('disk')->default('public');

            $table->timestamps();

            $table->index('user_id');
            $table->index('disk');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_uploads');
    }
};