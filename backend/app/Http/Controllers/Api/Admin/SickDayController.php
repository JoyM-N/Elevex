<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SickDay\ReviewSickDayRequest;
use App\Http\Resources\V1\SickDayResource;
use App\Services\SickDayService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * SickDayController (Admin)
 *
 * Admins can view all sick day requests and
 * approve or reject them.
 */
class SickDayController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly SickDayService $sickDayService
    ) {}

    /**
     * GET /api/v1/admin/sick-days
     * List all sick day requests.
     */
    public function index(Request $request): JsonResponse
    {
        $sickDays = $this->sickDayService->getAllSickDays(
            filters: $request->only(['status'])
        );

        return $this->paginated(
            SickDayResource::collection($sickDays),
            'Sick day requests retrieved successfully.'
        );
    }

    /**
     * PATCH /api/v1/admin/sick-days/{sickDay}/review
     * Approve or reject a sick day request.
     */
    public function review(ReviewSickDayRequest $request, int $id): JsonResponse
    {
        $action = $request->validated('action');

        $sickDay = $action === 'approved'
            ? $this->sickDayService->approveSickDay($id, $request->user(), $request->notes)
            : $this->sickDayService->rejectSickDay($id, $request->user(), $request->notes);

        $message = $action === 'approved'
            ? 'Sick day approved successfully.'
            : 'Sick day rejected.';

        return $this->success(new SickDayResource($sickDay), $message);
    }
}