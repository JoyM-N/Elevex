<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\AssignMembersRequest;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\V1\ProjectResource;
use App\Services\ProjectService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * ProjectController
 *
 * Thin controller — receives request, delegates to ProjectService,
 * returns shaped response. No business logic here.
 */
class ProjectController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly ProjectService $projectService
    ) {}

 //Get List all projects with pagination.
 
    public function index(Request $request): JsonResponse
    {
        $projects = $this->projectService->getAllProjects(
            filters: $request->only(['status', 'priority', 'search']),
            perPage: $request->integer('per_page', 15)
        );

        return $this->paginated(
            ProjectResource::collection($projects),
            'Projects retrieved successfully.'
        );
    }

     //POST Create a new project.

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $this->projectService->createProject(
            data: $request->validated(),
            admin: $request->user()
        );

        return $this->created(
            new ProjectResource($project),
            'Project created successfully.'
        );
    }

//GET /api/v1/admin/projects/{project}Get a single project with its milestones and members.
    
    public function show(Request $request, int $id): JsonResponse
    {
        $project = $this->projectService->getProjectById($id);

        $this->authorize('view', $project);

        return $this->success(
            new ProjectResource($project),
            'Project retrieved successfully.'
        );
    }

    
     // PUT /api/v1/admin/projects/{project} Update a project.
     
    public function update(UpdateProjectRequest $request, int $id): JsonResponse
    {
        $project = $this->projectService->updateProject(
            id: $id,
            data: $request->validated()
        );

        return $this->success(
            new ProjectResource($project),
            'Project updated successfully.'
        );
    }


      //DELETE /api/v1/admin/projects/{project} Delete a project.
     
    public function destroy(Request $request, int $id): JsonResponse
    {
        $project = $this->projectService->getProjectById($id);

        $this->authorize('delete', $project);

        $this->projectService->deleteProject($id);

        return $this->noContent('Project deleted successfully.');
    }

    //POST /api/v1/admin/projects/{project}/members Assign interns to a project.
    
    public function assignMembers(AssignMembersRequest $request, int $id): JsonResponse
    {
        $project = $this->projectService->assignMembers(
            id: $id,
            members: $request->validated('members')
        );

        return $this->success(
            new ProjectResource($project->load('members')),
            'Members assigned successfully.'
        );
    }

    // DELETE /api/v1/admin/projects/{project}/members/{user}Remove an intern from a project.
     
    public function removeMember(Request $request, int $projectId, int $userId): JsonResponse
    {
        $project = $this->projectService->getProjectById($projectId);

        $this->authorize('assignMembers', $project);

        $this->projectService->removeMember($projectId, $userId);

        return $this->noContent('Member removed successfully.');
    }
}