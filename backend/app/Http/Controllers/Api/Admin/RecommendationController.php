<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\RecommendationLetterResource;
use App\Models\RecommendationLetter;
use App\Services\RecommendationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * RecommendationController (Admin)
 *
 * Admins generate drafts from performance, edit them, then approve or reject.
 */
class RecommendationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly RecommendationService $recommendationService
    ) {}

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
     * POST /api/v1/admin/recommendations
     * Generate a draft letter for an intern from their performance data.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $this->authorize('create', RecommendationLetter::class);

        $letter = $this->recommendationService->generateForIntern(
            userId: (int) $request->integer('user_id'),
            admin: $request->user()
        );

        return $this->created(
            new RecommendationLetterResource($letter),
            'Draft recommendation letter generated successfully.'
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $letter = $this->recommendationService->getLetterById($id);

        $this->authorize('view', $letter);

        // Older pending records may lack a body — generate a draft on first view.
        if ($letter->isPending() && !filled($letter->body)) {
            $letter = $this->recommendationService->regenerateDraft($id);
        }

        return $this->success(
            new RecommendationLetterResource($letter),
            'Recommendation letter retrieved successfully.'
        );
    }

    /**
     * PUT /api/v1/admin/recommendations/{letter}
     * Save edits to the draft body.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'body' => ['required', 'string'],
        ]);

        $letter = $this->recommendationService->getLetterById($id);
        $this->authorize('update', $letter);

        $letter = $this->recommendationService->updateDraft($id, $request->string('body')->toString());

        return $this->success(
            new RecommendationLetterResource($letter),
            'Draft recommendation letter updated successfully.'
        );
    }

    /**
     * POST /api/v1/admin/recommendations/{letter}/regenerate
     * Rebuild draft body from current performance metrics.
     */
    public function regenerate(Request $request, int $id): JsonResponse
    {
        $letter = $this->recommendationService->getLetterById($id);
        $this->authorize('update', $letter);

        $letter = $this->recommendationService->regenerateDraft($id);

        return $this->success(
            new RecommendationLetterResource($letter),
            'Draft regenerated from performance data.'
        );
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $letter = $this->recommendationService->getLetterById($id);
        $this->authorize('approve', $letter);

        $letter = $this->recommendationService->approveLetter($id, $request->user());

        return $this->success(
            new RecommendationLetterResource($letter),
            'Recommendation letter approved and PDF generated successfully.'
        );
    }

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
