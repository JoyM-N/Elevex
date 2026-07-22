<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreAdminRequest;
use App\Http\Resources\V1\UserResource;
use App\Services\UserService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AdminController (Super Admin)
 *
 * Manage admin accounts — list and create.
 */
class AdminController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly UserService $userService
    ) {}

    /**
     * GET /api/v1/super-admin/admins
     */
    public function index(Request $request): JsonResponse
    {
        $admins = $this->userService->getAdmins(
            filters: $request->only(['search', 'is_active']),
            perPage: $request->integer('per_page', 20)
        );

        return $this->paginated(
            UserResource::collection($admins),
            'Admins retrieved successfully.'
        );
    }

    /**
     * POST /api/v1/super-admin/admins
     */
    public function store(StoreAdminRequest $request): JsonResponse
    {
        $admin = $this->userService->createAdmin($request->validated());

        return $this->created(
            new UserResource($admin),
            'Admin created successfully.'
        );
    }
}
