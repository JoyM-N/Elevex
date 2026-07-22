<?php

use App\Http\Controllers\Api\SuperAdmin\AdminController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard', function () {
    return response()->json([
        'success' => true,
        'message' => 'Super Admin dashboard.',
        'data'    => [],
    ]);
});

// Admin account management
Route::get('admins', [AdminController::class, 'index']);
Route::post('admins', [AdminController::class, 'store']);
