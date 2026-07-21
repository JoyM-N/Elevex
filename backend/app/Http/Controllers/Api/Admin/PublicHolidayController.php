<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PublicHoliday\StorePublicHolidayRequest;
use App\Http\Resources\V1\PublicHolidayResource;
use App\Services\CacheService;
use App\Services\PublicHolidayService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * PublicHolidayController (Admin)
 *
 * Admins manage the public holidays list.
 * Changes here automatically affect attendance and
 * consistency score calculations on next scheduler run.
 *
 * Cache is invalidated on every write operation
 * so the performance engine always uses fresh data.
 */
class PublicHolidayController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly PublicHolidayService $holidayService,
        private readonly CacheService         $cacheService
    ) {}

    /**
     * GET /api/v1/admin/public-holidays
     * List all public holidays.
     * Optional: ?year=2026 to filter by year.
     */
    public function index(Request $request): JsonResponse
    {
        $year     = $request->integer('year') ?: null;
        $holidays = $this->holidayService->getAllHolidays($year);

        return $this->success(
            PublicHolidayResource::collection($holidays),
            'Public holidays retrieved successfully.'
        );
    }

    /**
     * POST /api/v1/admin/public-holidays
     * Create a new public holiday.
     */
    public function store(StorePublicHolidayRequest $request): JsonResponse
    {
        $holiday = $this->holidayService->createHoliday($request->validated());

        // Invalidate cache for this year
        $this->cacheService->invalidatePublicHolidays(
            (int) date('Y', strtotime($request->date))
        );

        return $this->created(
            new PublicHolidayResource($holiday),
            'Public holiday created successfully.'
        );
    }

    /**
     * PUT /api/v1/admin/public-holidays/{holiday}
     * Update a public holiday.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'date' => ['sometimes', 'date'],
            'name' => ['sometimes', 'string', 'max:255'],
        ]);

        $holiday = $this->holidayService->updateHoliday($id, $request->validated());

        $this->cacheService->invalidatePublicHolidays(
            $holiday->date->year
        );

        return $this->success(
            new PublicHolidayResource($holiday),
            'Public holiday updated successfully.'
        );
    }

    /**
     * DELETE /api/v1/admin/public-holidays/{holiday}
     * Delete a public holiday.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->holidayService->deleteHoliday($id);

        return $this->noContent('Public holiday deleted successfully.');
    }
}