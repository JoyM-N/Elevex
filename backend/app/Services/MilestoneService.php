<?php

namespace App\Services;

use App\Models\Milestone;
use App\Models\Project;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * MilestoneService
 *
 * All milestone business logic.
 * Milestones always belong to a project —
 * every method takes projectId to scope queries correctly.
 */
class MilestoneService
{
    /**
     * Get all milestones for a specific project.
     * Ordered by start date so they display chronologically.
     */
    public function getProjectMilestones(int $projectId): Collection
    {
        return Milestone::where('project_id', $projectId)
            ->orderBy('start_date')
            ->get();
    }

    /**
     * Get a single milestone scoped to its project.
     * Prevents accessing milestones from other projects via URL manipulation.
     *
     * @throws ModelNotFoundException
     */
    public function getMilestoneById(int $milestoneId, int $projectId): Milestone
    {
        return Milestone::where('id', $milestoneId)
            ->where('project_id', $projectId)
            ->firstOrFail();
    }

    /**
     * Create a milestone inside a project.
     *
     * @throws ModelNotFoundException
     */
    public function createMilestone(int $projectId, array $data): Milestone
    {
        // Verify project exists before creating milestone
        Project::findOrFail($projectId);

        return Milestone::create([
            ...$data,
            'project_id' => $projectId,
        ]);
    }

    /**
     * Update a milestone.
     *
     * @throws ModelNotFoundException
     */
    public function updateMilestone(int $milestoneId, int $projectId, array $data): Milestone
    {
        $milestone = $this->getMilestoneById($milestoneId, $projectId);
        $milestone->update($data);

        return $milestone->fresh();
    }

    /**
     * Delete a milestone.
     * Cascades to tasks automatically via DB foreign key constraint.
     *
     * @throws ModelNotFoundException
     */
    public function deleteMilestone(int $milestoneId, int $projectId): void
    {
        $this->getMilestoneById($milestoneId, $projectId)->delete();
    }

    /**
     * Get the parent project of a milestone.
     * Used in MilestoneController for authorization checks.
     *
     * @throws ModelNotFoundException
     */
    public function getProjectById(int $projectId): Project
    {
        return Project::findOrFail($projectId);
    }
}