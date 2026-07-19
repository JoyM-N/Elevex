<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Evaluation\StoreEvaluationRequest;
use App\Http\Requests\Evaluation\UpdateEvaluationRequest;
use App\Http\Resources\V1\EvaluationResource;
use App\Services\EvaluationService;
use App\Services\PerformanceService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * EvaluationController (Admin)
 *
 * Admins create and update evaluations for interns.
 * After every create or update, PerformanceService
 * is triggered to recalculate the intern's metrics
 * since quality_score and teamwork_score derive from evaluation.
 */
class EvaluationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly EvaluationService $evaluationService,
        private readonly PerformanceService $performanceService
    ) {}

    /**
     * GET /api/v1/admin/evaluations
     * List all evaluations.
     */
    public function index(Request $request): JsonResponse
    {
        $evaluations = $this->evaluationService->getAllEvaluations(
            filters: $request->only(['user_id', 'internship_id'])
        );

        return $this->success(
            EvaluationResource::collection($evaluations),
            'Evaluations retrieved successfully.'
        );
    }

    /**
     * POST /api/v1/admin/evaluations
     * Create a new evaluation for an intern.
     * Triggers performance recalculation after creation.
     */
    public function store(StoreEvaluationRequest $request): JsonResponse
    {
        $evaluation = $this->evaluationService->createEvaluation(
            data: $request->validated(),
            admin: $request->user()
        );

        // Recalculate performance metrics now that evaluation exists
        // quality_score and teamwork_score depend on this evaluation
        $intern = \App\Models\User::find($request->validated('user_id'));
        $this->performanceService->calculate($intern);

        return $this->created(
            new EvaluationResource($evaluation),
            'Evaluation submitted successfully.'
        );
    }

    /**
     * GET /api/v1/admin/evaluations/{evaluation}
     * View a single evaluation.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $evaluation = $this->evaluationService->getEvaluationById($id);

        $this->authorize('view', $evaluation);

        return $this->success(
            new EvaluationResource($evaluation),
            'Evaluation retrieved successfully.'
        );
    }

    /**
     * PUT /api/v1/admin/evaluations/{evaluation}
     * Update an existing evaluation.
     * Triggers performance recalculation after update.
     */
    public function update(UpdateEvaluationRequest $request, int $id): JsonResponse
    {
        $evaluation = $this->evaluationService->updateEvaluation(
            id: $id,
            data: $request->validated()
        );

        // Recalculate performance since scores changed
        $this->performanceService->calculate($evaluation->user);

        return $this->success(
            new EvaluationResource($evaluation),
            'Evaluation updated successfully.'
        );
    }
}