<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\V1\UserResource;
use App\Services\AuthenticationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AuthController
 *
 * Handles all authentication endpoints.
 *
 * This controller is intentionally thin.
 * Each method does exactly three things:
 *   1. Receive the validated request (Form Request handles validation)
 *   2. Call one method on AuthenticationService
 *   3. Return a response
 *
 * No business logic lives here.
 * No database calls happen here.
 * Everything is delegated to AuthenticationService.
 */
class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Inject AuthenticationService via constructor.
     *
     * Constructor injection is the professional standard in Laravel.
     * Laravel's service container automatically resolves and injects
     * the service — we never call new AuthenticationService() manually.
     */
    public function __construct(
        private readonly AuthenticationService $authService
    ) {}

    /**
     * POST /api/v1/auth/login
     *
     * Authenticate user and establish session.
     * LoginRequest validates credentials before this method runs.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->authService->login(
            credentials: $request->only('email', 'password'),
            remember: $request->boolean('remember')
        );

        return $this->success(
            data: new UserResource($user),
            message: 'Login successful.'
        );
    }

    /**
     * POST /api/v1/auth/logout
     *
     * Invalidate session and log out.
     * Requires authentication — you must be logged in to log out.
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout();

        return $this->success(message: 'Logged out successfully.');
    }

    /**
     * GET /api/v1/auth/user
     *
     * Return the currently authenticated user.
     * The frontend calls this on app load to check if session is valid
     * and to get the user's role for rendering the correct dashboard.
     */
    public function user(Request $request): JsonResponse
    {
        return $this->success(
            data: new UserResource($request->user()),
            message: 'User retrieved successfully.'
        );
    }

    /**
     * POST /api/v1/auth/forgot-password
     *
     * Send a password reset link to the given email.
     * ForgotPasswordRequest confirms email exists before this runs.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->sendPasswordResetLink($request->email);

        return $this->success(
            message: 'Password reset link sent to your email address.'
        );
    }

    /**
     * POST /api/v1/auth/reset-password
     *
     * Reset password using the token from the reset email.
     * ResetPasswordRequest validates token, email and new password.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $this->authService->resetPassword(
            $request->only('token', 'email', 'password', 'password_confirmation')
        );

        return $this->success(message: 'Password reset successfully. Please log in.');
    }

    /**
     * PUT /api/v1/auth/password
     *
     * Change password for the authenticated user.
     * Requires current password verification.
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->authService->changePassword(
            user: $request->user(),
            currentPassword: $request->current_password,
            newPassword: $request->password
        );

        return $this->success(message: 'Password changed successfully.');
    }
}  