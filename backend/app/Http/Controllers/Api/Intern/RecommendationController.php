<?php

namespace App\Http\Controllers\Api\Intern;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\RecommendationLetterResource;
use App\Services\RecommendationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * RecommendationController (Intern)
 *
 * Interns can request letters and download approved ones.
 * Read-only access to their own letters only.
 */
class RecommendationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly RecommendationService $recommendationService
    ) {}

    /**
     * GET /api/v1/intern/recommendations
     * List own recommendation letter requests.
     */
    public function index(Request $request): JsonResponse
    {
        $letters = $this->recommendationService->getAllLetters(
            filters: $request->only(['status']),
            scopeToUser: $request->user()
        );

        return $this->success(
            RecommendationLetterResource::collection($letters),
            'Recommendation letters retrieved successfully.'
        );
    }

    /**
     * POST /api/v1/intern/recommendations
     * Request a recommendation letter for an internship.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'internship_id' => ['required', 'integer', 'exists:internships,id'],
        ]);

        $this->authorize('create', \App\Models\RecommendationLetter::class);

        $letter = $this->recommendationService->requestLetter(
            intern: $request->user(),
            internshipId: $request->internship_id
        );

        return $this->created(
            new RecommendationLetterResource($letter),
            'Recommendation letter requested successfully.'
        );
    }

    /**
     * GET /api/v1/intern/recommendations/{letter}
     * View a specific recommendation letter.
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
     * GET /api/v1/intern/recommendations/{letter}/download
     * Download the generated PDF for an approved letter.
     */
    public function download(Request $request, int $id): BinaryFileResponse
    {
        $letter = $this->recommendationService->getLetterById($id);

        $this->authorize('download', $letter);

        return response()->download(
            storage_path('app/public/' . $letter->pdf_path),
            'recommendation_letter_' . $letter->user->name . '.pdf'
        );
    }
}