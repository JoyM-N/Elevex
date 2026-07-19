<?php

namespace App\Http\Controllers\Api\Intern;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\AchievementResource;
use App\Http\Resources\V1\PerformanceMetricResource;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * PerformanceController (Intern)
 *
 * Interns can view their own performance metrics
 * and achievements. Read-only — no recalculation.
 */
class PerformanceController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/v1/intern/performance
     * View own performance metrics.
     */
    public function index(Request $request): JsonResponse
    {
        $metric = $request->user()
            ->performanceMetrics()
            ->latest()
            ->first();

        if (!$metric) {
            return $this->success(
                null,
                'No performance metrics available yet.'
            );
        }

        return $this->success(
            new PerformanceMetricResource($metric),
            'Performance metrics retrieved successfully.'
        );
    }

    /**
     * GET /api/v1/intern/achievements
     * View own earned achievements.
     */
    public function achievements(Request $request): JsonResponse
    {
        $achievements = $request->user()->achievements()->get();

        return $this->success(
            AchievementResource::collection($achievements),
            'Achievements retrieved successfully.'
        );
    }
}