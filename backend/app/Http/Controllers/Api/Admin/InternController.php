<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\OnboardInternRequest;
use App\Http\Requests\User\UpdateInternRequest;
use App\Http\Resources\V1\UserResource;
use App\Services\UserService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * InternController
 *
 * Intern directory, profile view, onboarding, and edits.
 */
class InternController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly UserService $userService
    ) {}

    /**
     * GET /api/v1/admin/interns
     */
    public function index(Request $request): JsonResponse
    {
        $interns = $this->userService->getInterns(
            filters: $request->only(['search', 'is_active']),
            perPage: $request->integer('per_page', 50)
        );

        return $this->paginated(
            UserResource::collection($interns),
            'Interns retrieved successfully.'
        );
    }

    /**
     * GET /api/v1/admin/interns/{user}
     */
    public function show(Request $request, int $user): JsonResponse
    {
        $intern = $this->userService->getInternById($user);

        $this->authorize('view', $intern);

        return $this->success(
            new UserResource($intern),
            'Intern retrieved successfully.'
        );
    }

    /**
     * POST /api/v1/admin/interns
     */
    public function store(OnboardInternRequest $request): JsonResponse
    {
        $intern = $this->userService->onboardIntern(
            data: $request->validated(),
            actingAdmin: $request->user()
        );

        return $this->created(
            new UserResource($intern),
            'Intern onboarded successfully.'
        );
    }

    /**
     * PUT/PATCH /api/v1/admin/interns/{user}
     */
    public function update(UpdateInternRequest $request, int $user): JsonResponse
    {
        $intern = $this->userService->getInternById($user);

        $this->authorize('update', $intern);

        $updated = $this->userService->updateIntern(
            intern: $intern,
            data: $request->validated()
        );

        return $this->success(
            new UserResource($updated),
            'Intern updated successfully.'
        );
    }
}
