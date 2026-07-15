<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Milestone\StoreMilestoneRequest;
use App\Http\Requests\Milestone\UpdateMilestoneRequest;
use App\Http\Resources\V1\MilestoneResource;
use App\Services\MilestoneService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;


class MilestoneController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly MilestoneService $milestoneService
    ) {}

    // GET List all milestones for a project.
     
    public function index(Request $request, $projectId): JsonResponse
    {
        $milestones = $this->milestoneService->getProjectMilestones($projectId);

        return $this->success(
            MilestoneResource::collection($milestones),
            'Milestones retrieved successfully.'
        );
    }

   //POST Create a new milestone inside a project.
  
    public function store(StoreMilestoneRequest $request, $projectId): JsonResponse
    {
        $milestone = $this->milestoneService->createMilestone(
            projectId: $projectId,
            data: $request->validated()
        );

        return $this->created(
            new MilestoneResource($milestone),
            'Milestone created successfully.'
        );
    }

     //GET Get a single milestone with its tasks.

    public function show(Request $request, $projectId, $milestoneId): JsonResponse
    {
        $milestone = $this->milestoneService->getMilestoneById(
            $milestoneId,
            $projectId
        );

        return $this->success(
            new MilestoneResource($milestone->load('tasks')),
            'Milestone retrieved successfully.'
        );
    }

   //PUT update a milestone.
  
    public function update(UpdateMilestoneRequest $request, $projectId, $milestoneId): JsonResponse
    {
        $milestone = $this->milestoneService->updateMilestone(
            milestoneId: $milestoneId,
            projectId: $projectId,
            data: $request->validated()
        );

        return $this->success(
            new MilestoneResource($milestone),
            'Milestone updated successfully.'
        );
    }

    //DELETEDelete a milestone.
     
    public function destroy(Request $request, $projectId, $milestoneId): JsonResponse
    {
        $project = $this->milestoneService->getProjectById($projectId);

        $this->authorize('update', $project);

        $this->milestoneService->deleteMilestone($milestoneId, $projectId);

        return $this->noContent('Milestone deleted successfully.');
    }
}