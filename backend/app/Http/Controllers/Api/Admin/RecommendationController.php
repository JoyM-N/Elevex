<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\RecommendationLetterResource;
use App\Services\RecommendationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * RecommendationController (Admin)
 *
 * Admins can view all letter requests and approve or reject them.
 * Approving triggers PDF generation via RecommendationService.
 */
class RecommendationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly RecommendationService $recommendationService
    ) {}

    /**
     * GET /api/v1/admin/recommendations
     * List all recommendation letter requests.
     */
    public function index(Request $request): JsonResponse
    {
        $letters = $this->recommendationService->getAllLetters(
            filters: $request->only(['status'])
        );

        return $this->success(
            RecommendationLetterResource::collection($letters),
            'Recommendation letters retrieved successfully.'
        );
    }

    /**
     * GET /api/v1/admin/recommendations/{letter}
     * View a single recommendation letter request.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $letter = $this->recommendationService->getLetterById($id);

        $this->authorize('view', $letter);

        return $this->success(
            new RecommendationLetterResource($letter),
            'Recommendation letter retrieved successfully.'
        );
    }

    /**
     * POST /api/v1/admin/recommendations/{letter}/approve
     * Approve a letter request and generate the PDF.
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $letter = $this->recommendationService->getLetterById($id);

        $this->authorize('approve', $letter);

        $letter = $this->recommendationService->approveLetter($id, $request->user());

        return $this->success(
            new RecommendationLetterResource($letter),
            'Recommendation letter approved and generated successfully.'
        );
    }

    /**
     * POST /api/v1/admin/recommendations/{letter}/reject
     * Reject a letter request with optional notes.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'notes' => ['nullable', 'string'],
        ]);

        $letter = $this->recommendationService->getLetterById($id);

        $this->authorize('approve', $letter);

        $letter = $this->recommendationService->rejectLetter(
            letterId: $id,
            admin: $request->user(),
            notes: $request->notes
        );

        return $this->success(
            new RecommendationLetterResource($letter),
            'Recommendation letter request rejected.'
        );
    }
}