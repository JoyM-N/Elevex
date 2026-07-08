<?php

use App\Http\Controllers\Api\Auth\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Elevex API Routes — v1
|--------------------------------------------------------------------------
|
| Route groups explained:
|
| Public routes — no authentication required
|   Anyone can hit these endpoints.
|   Used for login, password reset etc.
|
| Authenticated routes — requires valid session
|   'auth:sanctum' middleware checks for a valid session cookie.
|   Returns 401 if not authenticated.
|
| Role protected routes — requires authentication + specific role
|   'role:admin' — only admins and super admins
|   'role:intern' — only interns
|   Built in Phase 4 when we add Policies and authorization.
|
*/

Route::prefix('v1')->group(function () {

    // =========================================================
    // Health Check — Public
    // =========================================================
    Route::get('/health', function () {
        return response()->json([
            'success' => true,
            'message' => 'Elevex API is running.',
            'version' => '1.0.0',
        ]);
    });

    // =========================================================
    // Authentication Routes — Public
    // No session required to hit these
    // =========================================================
    Route::prefix('auth')->name('auth.')->group(function () {

        // Login — establishes session cookie
        Route::post('login', [AuthController::class, 'login'])
            ->name('login');

        // Forgot password — sends reset email
        Route::post('forgot-password', [AuthController::class, 'forgotPassword'])
            ->name('forgot-password');

        // Reset password — uses token from email
        Route::post('reset-password', [AuthController::class, 'resetPassword'])
            ->name('reset-password');

    });

    // =========================================================
    // Authenticated Routes — Valid session required
    // auth:sanctum checks the session cookie on every request
    // =========================================================
    Route::middleware('auth:sanctum')->group(function () {

        // Get current authenticated user
        // Frontend calls this on load to hydrate user state
        Route::get('auth/user', [AuthController::class, 'user'])
            ->name('auth.user');

        // Logout — invalidates session
        Route::post('auth/logout', [AuthController::class, 'logout'])
            ->name('auth.logout');

        // Change password — requires current password
        Route::put('auth/password', [AuthController::class, 'changePassword'])
            ->name('auth.password.change');

    });

});