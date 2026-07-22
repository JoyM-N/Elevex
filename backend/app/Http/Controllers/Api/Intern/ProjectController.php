<?php

namespace App\Http\Controllers\Api\Intern;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ProjectResource;
use App\Models\Project;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Intern ProjectController
 *
 * Read-only access to projects the authenticated intern belongs to.
 */
class ProjectController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/v1/intern/projects
     */
    public function index(Request $request): JsonResponse
    {
        $projects = $request->user()
            ->projects()
            ->with(['createdBy', 'milestones'])
            ->latest('projects.created_at')
            ->paginate($request->integer('per_page', 15));

        return $this->paginated(
            ProjectResource::collection($projects),
            'Projects retrieved successfully.'
        );
    }

    /**
     * GET /api/v1/intern/projects/{project}
     */
    public function show(Request $request, int $project): JsonResponse
    {
        $user = $request->user();

        $memberProject = $user->projects()
            ->where('projects.id', $project)
            ->first();

        if (!$memberProject) {
            return $this->forbidden('You are not a member of this project.');
        }

        $full = Project::with(['createdBy', 'members', 'milestones'])
            ->findOrFail($project);

        $full->setAttribute('my_team_role', $memberProject->pivot->team_role);

        return $this->success(
            new ProjectResource($full),
            'Project retrieved successfully.'
        );
    }
}
