<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateProfileRequest;
use App\Http\Requests\User\UploadAvatarRequest;
use App\Http\Resources\V1\UserResource;
use App\Services\UserService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * ProfileController
 *
 * Authenticated users update their own profile and avatar.
 */
class ProfileController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly UserService $userService
    ) {}

    /**
     * PUT /api/v1/auth/profile
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->userService->updateProfile(
            user: $request->user(),
            data: $request->validated()
        );

        return $this->success(
            new UserResource($user),
            'Profile updated successfully.'
        );
    }

    /**
     * POST /api/v1/auth/avatar
     */
    public function uploadAvatar(UploadAvatarRequest $request): JsonResponse
    {
        $user = $this->userService->uploadAvatar(
            user: $request->user(),
            file: $request->file('avatar')
        );

        return $this->success(
            new UserResource($user),
            'Avatar uploaded successfully.'
        );
    }
}
