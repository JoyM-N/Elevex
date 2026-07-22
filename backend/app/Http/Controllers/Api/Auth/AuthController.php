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


class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly AuthenticationService $authService
    ) {}


    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            credentials: $request->only('email', 'password'),
            remember: $request->boolean('remember'),
            tokenName: $request->input('device_name', 'api'),
        );

        return $this->success(
            data: [
                'user'       => (new UserResource($result['user']))->resolve(),
                'token'      => $result['token'],
                'token_type' => 'Bearer',
            ],
            message: 'Login successful.'
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout();

        return $this->success(message: 'Logged out successfully.');
    }

  
    public function user(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing('activeInternship');

        return $this->success(
            data: new UserResource($user),
            message: 'User retrieved successfully.'
        );
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->sendPasswordResetLink($request->email);

        return $this->success(
            message: 'Password reset link sent to your email address.'
        );
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $this->authService->resetPassword(
            $request->only('token', 'email', 'password', 'password_confirmation')
        );

        return $this->success(message: 'Password reset successfully. Please log in.');
    }

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