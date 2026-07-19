<?php

namespace App\Services;

use App\Models\Evaluation;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

/**
 * EvaluationService
 *
 * Handles admin evaluation of interns.
 *
 * Key rules:
 *   - One evaluation per intern per internship
 *     enforced by unique constraint on DB and checked here
 *   - Only the evaluating admin or super admin can update
 *   - Evaluations are never deleted — permanent records
 *
 * After creating or updating an evaluation,
 * PerformanceService must be triggered to recalculate
 * quality_score and teamwork_score. This is done in
 * the controller after calling this service.
 */
class EvaluationService
{
    /**
     * Get all evaluations.
     * Optionally filter by internship or user.
     */
    public function getAllEvaluations(array $filters = []): Collection
    {
        return Evaluation::with(['user', 'internship', 'evaluatedBy'])
            ->when(isset($filters['user_id']), function ($query) use ($filters) {
                $query->where('user_id', $filters['user_id']);
            })
            ->when(isset($filters['internship_id']), function ($query) use ($filters) {
                $query->where('internship_id', $filters['internship_id']);
            })
            ->get();
    }

    /**
     * Get a single evaluation by ID.
     *
     * @throws ModelNotFoundException
     */
    public function getEvaluationById(int $id): Evaluation
    {
        return Evaluation::with(['user', 'internship', 'evaluatedBy'])
            ->findOrFail($id);
    }

    /**
     * Create a new evaluation for an intern.
     *
     * Business rule:
     *   One evaluation per intern per internship.
     *   If one already exists this throws a ValidationException.
     *
     * @throws ValidationException
     */
    public function createEvaluation(array $data, User $admin): Evaluation
    {
        // Check if evaluation already exists for this intern + internship
        $exists = Evaluation::where('user_id', $data['user_id'])
            ->where('internship_id', $data['internship_id'])
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'user_id' => ['An evaluation already exists for this intern and internship.'],
            ]);
        }

        return Evaluation::create([
            ...$data,
            'evaluated_by' => $admin->id,
        ]);
    }

    /**
     * Update an existing evaluation.
     *
     * @throws ModelNotFoundException
     */
    public function updateEvaluation(int $id, array $data): Evaluation
    {
        $evaluation = Evaluation::findOrFail($id);
        $evaluation->update($data);

        return $evaluation->fresh(['user', 'internship', 'evaluatedBy']);
    }
}