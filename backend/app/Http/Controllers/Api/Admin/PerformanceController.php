<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\AchievementResource;
use App\Http\Resources\V1\PerformanceMetricResource;
use App\Models\User;
use App\Services\AchievementService;
use App\Services\PerformanceService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * PerformanceController (Admin)
 *
 * Admins can view performance metrics and trigger
 * manual recalculation for any intern.
 */
class PerformanceController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly PerformanceService $performanceService,
        private readonly AchievementService $achievementService
    ) {}

    /**
     * GET /api/v1/admin/interns/{user}/performance
     * View performance metrics for a specific intern.
     */
    public function show(Request $request, int $userId): JsonResponse
    {
        $intern = User::findOrFail($userId);
        $metric = $intern->performanceMetrics()->latest()->first();

        if (!$metric) {
            return $this->notFound('No performance metrics found for this intern.');
        }

        return $this->success(
            new PerformanceMetricResource($metric),
            'Performance metrics retrieved successfully.'
        );
    }

    /**
     * POST /api/v1/admin/interns/{user}/performance/recalculate
     * Manually trigger performance recalculation for an intern.
     * Also checks and awards any new achievements.
     */
    public function recalculate(Request $request, int $userId): JsonResponse
    {
        $intern = User::findOrFail($userId);

        // Recalculate performance metrics
        $metric = $this->performanceService->calculate($intern);

        // Check and award achievements based on new metrics
        $newAchievements = $this->achievementService->evaluateForUser($intern);

        return $this->success(
            [
                'metrics'          => new PerformanceMetricResource($metric),
                'new_achievements' => $newAchievements,
            ],
            'Performance recalculated successfully.'
        );
    }

    /**
     * GET /api/v1/admin/interns/{user}/achievements
     * View all achievements earned by a specific intern.
     */
    public function achievements(Request $request, int $userId): JsonResponse
    {
        $intern       = User::findOrFail($userId);
        $achievements = $intern->achievements()->get();

        return $this->success(
            AchievementResource::collection($achievements),
            'Achievements retrieved successfully.'
        );
    }
}