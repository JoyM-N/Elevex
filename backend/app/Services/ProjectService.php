<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ProjectService
{
    /**
     * Get all projects with optional filters and pagination.
     *
     * Filters:
     *   status   — filter by project status
     *   priority — filter by priority
     *   search   — search by title
     */
    public function getAllProjects(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return Project::query()
            ->with(['createdBy'])
            ->when(isset($filters['status']), function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            })
            ->when(isset($filters['priority']), function ($query) use ($filters) {
                $query->where('priority', $filters['priority']);
            })
            ->when(isset($filters['search']), function ($query) use ($filters) {
                $query->where('title', 'like', "%{$filters['search']}%");
            })
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Get a single project by ID with relationships loaded.
     *
     * @throws ModelNotFoundException
     */
    public function getProjectById(int $id): Project
    {
        return Project::with(['createdBy', 'members', 'milestones'])
            ->findOrFail($id);
    }

    /**
     * Create a new project.
     * Sets created_by to the authenticated admin.
     */
    public function createProject(array $data, User $admin): Project
    {
        return Project::create([
            ...$data,
            'created_by' => $admin->id,
        ]);
    }

    /**
     * Update an existing project.
     *
     * @throws ModelNotFoundException
     */
    public function updateProject(int $id, array $data): Project
    {
        $project = Project::findOrFail($id);
        $project->update($data);

        return $project->fresh(['createdBy', 'members', 'milestones']);
    }

    /**
     * Delete a project.
     * SoftDeletes — record is not permanently removed.
     *
     * @throws ModelNotFoundException
     */
    public function deleteProject(int $id): void
    {
        Project::findOrFail($id)->delete();
    }

    /**
     * Assign interns to a project.
     * Uses sync to avoid duplicate memberships.
     *
     * @throws ModelNotFoundException
     */
    public function assignMembers(int $id, array $members): Project
    {
        $project = Project::findOrFail($id);

        // Build the sync array: [user_id => ['team_role' => role]]
        $syncData = collect($members)->mapWithKeys(function ($member) {
            return [
                $member['user_id'] => ['team_role' => $member['team_role']]
            ];
        })->toArray();

        // sync replaces existing members with new list
        // syncWithoutDetaching adds without removing existing
        $project->members()->sync($syncData);

        return $project->fresh('members');
    }

    /**
     * Remove a specific intern from a project.
     *
     * @throws ModelNotFoundException
     */
    public function removeMember(int $projectId, int $userId): void
    {
        $project = Project::findOrFail($projectId);
        $project->members()->detach($userId);
    }
}