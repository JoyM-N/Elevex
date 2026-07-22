<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Health Check — no auth required
    Route::get('/health', function () {
        return response()->json([
            'success' => true,
            'message' => 'Elevex API is running.',
            'version' => '1.0.0',
        ]);
    });

    // Public Auth Routes — no authentication required
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('login', [AuthController::class, 'login'])
            ->name('login');

        Route::post('forgot-password', [AuthController::class, 'forgotPassword'])
            ->name('forgot-password');

        Route::post('reset-password', [AuthController::class, 'resetPassword'])
            ->name('reset-password');
    });

    // Authenticated Routes — any role
    Route::middleware(['auth:sanctum'])->group(function () {

        // Auth
        Route::prefix('auth')->name('auth.')->group(function () {
            Route::get('user', [AuthController::class, 'user'])
                ->name('user');

            Route::post('logout', [AuthController::class, 'logout'])
                ->name('logout');

            Route::put('password', [AuthController::class, 'changePassword'])
                ->name('password.change');

            Route::put('profile', [ProfileController::class, 'update'])
                ->name('profile.update');

            Route::post('avatar', [ProfileController::class, 'uploadAvatar'])
                ->name('avatar.upload');
        });
    });

    // Super Admin Routes — role: super_admin only
    Route::middleware(['auth:sanctum', 'role:super_admin'])
        ->prefix('super-admin')
        ->name('super-admin.')
        ->group(base_path('routes/api/super_admin.php'));

    // Admin Routes — role: super_admin or admin
    Route::middleware(['auth:sanctum', 'role:super_admin,admin'])
        ->prefix('admin')
        ->name('admin.')
        ->group(base_path('routes/api/admin.php'));

    // Intern Routes — role: intern only
    Route::middleware(['auth:sanctum', 'role:intern'])
        ->prefix('intern')
        ->name('intern.')
        ->group(base_path('routes/api/intern.php'));

});