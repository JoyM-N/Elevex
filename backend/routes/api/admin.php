<?php

use Illuminate\Support\Facades\Route;
//Accessible by both Admin and Super Admin roles.
// Placeholder — Admin routes added per phase as features are built
Route::get('/dashboard', function () {
    return response()->json([
        'success' => true,
        'message' => 'Admin dashboard.',
        'data'    => [],
    ]);
});