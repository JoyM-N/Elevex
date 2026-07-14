<?php

use Illuminate\Support\Facades\Route;

// Placeholder — Intern routes added per phase as features are built
Route::get('/dashboard', function () {
    return response()->json([
        'success' => true,
        'message' => 'Intern dashboard.',
        'data'    => [],
    ]);
});