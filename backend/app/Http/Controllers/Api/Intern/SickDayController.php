<?php

namespace App\Http\Controllers\Api\Intern;

use App\Http\Controllers\Controller;
use App\Http\Requests\SickDay\StoreSickDayRequest;
use App\Http\Resources\V1\SickDayResource;
use App\Services\SickDayService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * SickDayController (Intern)
 *
 * Interns can submit sick day requests and
 * view the status of their own requests.
 */
class SickDayController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly SickDayService $sickDayService
    ) {}

    /**
     * GET /api/v1/intern/sick-days
     * List own sick day requests.
     */
    public function index(Request $request): JsonResponse
    {
        $sickDays = $this->sickDayService->getAllSickDays(
            filters: $request->only(['status']),
            scopeToUser: $request->user()
        );

        return $this->paginated(
            SickDayResource::collection($sickDays),
            'Sick day requests retrieved successfully.'
        );
    }

    /**
     * POST /api/v1/intern/sick-days
     * Submit a sick day request.
     */
    public function store(StoreSickDayRequest $request): JsonResponse
    {
        $sickDay = $this->sickDayService->requestSickDay(
            intern: $request->user(),
            data: $request->validated()
        );

        return $this->created(
            new SickDayResource($sickDay),
            'Sick day request submitted successfully.'
        );
    }
}