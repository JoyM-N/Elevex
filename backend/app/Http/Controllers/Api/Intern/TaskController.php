<?php

namespace App\Http\Controllers\Api\Intern;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\CompleteTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\V1\TaskResource;
use App\Services\TaskService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Intern TaskController
 *
 * Interns can view their own tasks and mark them complete.
 * Interns cannot create or delete tasks — that's admin only.
 */
class TaskController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly TaskService $taskService
    ) {}

    /**
     * GET /api/v1/intern/tasks
     * List tasks assigned to the authenticated intern only.
     */
    public function index(Request $request): JsonResponse
    {
        $tasks = $this->taskService->getAllTasks(
            filters: $request->only(['status', 'priority', 'task_type']),
            perPage: $request->integer('per_page', 15),
            scopeToUser: $request->user() // Only their own tasks
        );

        return $this->paginated(
            TaskResource::collection($tasks),
            'Tasks retrieved successfully.'
        );
    }

    /**
     * GET /api/v1/intern/tasks/{task}
     * View a single task assigned to this intern.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $task = $this->taskService->getTaskById($id);

        $this->authorize('view', $task);

        return $this->success(
            new TaskResource($task),
            'Task retrieved successfully.'
        );
    }

    /**
     * PATCH /api/v1/intern/tasks/{task}/complete
     * Mark a task as completed.
     * Records actual_hours and sets completed_at timestamp.
     */
    public function complete(CompleteTaskRequest $request, int $id): JsonResponse
    {
        $task = $this->taskService->completeTask(
            id: $id,
            actualHours: $request->validated('actual_hours')
        );

        return $this->success(
            new TaskResource($task),
            'Task marked as completed.'
        );
    }
}