<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\V1\TaskResource;
use App\Services\TaskService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin TaskController
 *
 * Admins can create, view, update and delete tasks.
 * Thin controller — all logic in TaskService.
 */
class TaskController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly TaskService $taskService
    ) {}

    /**
     * GET /api/v1/admin/tasks
     * List all tasks with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $tasks = $this->taskService->getAllTasks(
            filters: $request->only(['status', 'priority', 'task_type', 'milestone_id', 'search']),
            perPage: $request->integer('per_page', 15)
        );

        return $this->paginated(
            TaskResource::collection($tasks),
            'Tasks retrieved successfully.'
        );
    }

    /**
     * POST /api/v1/admin/tasks
     * Create a new task and assign to an intern.
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $this->taskService->createTask(
            data: $request->validated(),
            admin: $request->user()
        );

        return $this->created(
            new TaskResource($task),
            'Task created successfully.'
        );
    }

    /**
     * GET /api/v1/admin/tasks/{task}
     * Get a single task.
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
     * PUT /api/v1/admin/tasks/{task}
     * Update a task.
     */
    public function update(UpdateTaskRequest $request, int $id): JsonResponse
    {
        $task = $this->taskService->updateTask(
            id: $id,
            data: $request->validated()
        );

        return $this->success(
            new TaskResource($task),
            'Task updated successfully.'
        );
    }

    /**
     * DELETE /api/v1/admin/tasks/{task}
     * Delete a task.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $task = $this->taskService->getTaskById($id);

        $this->authorize('delete', $task);

        $this->taskService->deleteTask($id);

        return $this->noContent('Task deleted successfully.');
    }
}