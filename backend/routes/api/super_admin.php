<?php

use Illuminate\Support\Facades\Route;

// Placeholder — Super Admin routes added per phase as features are built
Route::get('/dashboard', function () {
    return response()->json([
        'success' => true,
        'message' => 'Super Admin dashboard.',
        'data'    => [],
    ]);
});