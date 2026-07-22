<?php

namespace App\Services;

use App\Enums\TaskStatus;
use App\Models\Task;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * TaskService
 *
 * All task business logic lives here.
 *
 * Key business rules enforced here:
 *   - completed_at is set automatically when task is completed
 *   - actual_hours is recorded on completion
 *   - Terminal tasks cannot be modified (enforced in Policy)
 *   - General tasks have no milestone_id
 */
class TaskService
{
    /**
     * Get all tasks with optional filters.
     * Admins see all tasks.
     * Interns see only tasks assigned to them — pass user to scope.
     */
    public function getAllTasks(
        array $filters = [],
        int $perPage = 15,
        ?User $scopeToUser = null
    ): LengthAwarePaginator {
        return Task::query()
            ->with(['assignedTo', 'createdBy', 'milestone.project'])
            ->when($scopeToUser, function ($query) use ($scopeToUser) {
                // Scope to only tasks assigned to this intern
                $query->where('assigned_to', $scopeToUser->id);
            })
            ->when(isset($filters['status']), function ($query) use ($filters) {
                $query->where('status', $filters['status']);
            })
            ->when(isset($filters['priority']), function ($query) use ($filters) {
                $query->where('priority', $filters['priority']);
            })
            ->when(isset($filters['task_type']), function ($query) use ($filters) {
                $query->where('task_type', $filters['task_type']);
            })
            ->when(isset($filters['milestone_id']), function ($query) use ($filters) {
                $query->where('milestone_id', $filters['milestone_id']);
            })
            ->when(isset($filters['search']), function ($query) use ($filters) {
                $query->where('title', 'like', "%{$filters['search']}%");
            })
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Get a single task by ID.
     *
     * @throws ModelNotFoundException
     */
    public function getTaskById(int $id): Task
    {
        return Task::with(['assignedTo', 'createdBy', 'milestone.project'])
            ->findOrFail($id);
    }

    /**
     * Create a new task.
     * Sets created_by to the authenticated admin.
     * Status defaults to To Do — must be set on the model (DB default
     * alone is not hydrated into the in-memory instance after create).
     */
    public function createTask(array $data, User $admin): Task
    {
        $task = Task::create([
            ...$data,
            'status'     => $data['status'] ?? TaskStatus::Todo,
            'created_by' => $admin->id,
        ]);

        return $task->fresh(['assignedTo', 'createdBy', 'milestone.project']);
    }

    /**
     * Update an existing task.
     *
     * @throws ModelNotFoundException
     */
    public function updateTask(int $id, array $data): Task
    {
        $task = Task::findOrFail($id);
        $task->update($data);

        return $task->fresh(['assignedTo', 'createdBy', 'milestone']);
    }

    /**
     * Mark a task as completed.
     *
     * This is a dedicated method — not just an update —
     * because completing a task has side effects:
     *   - status must change to 'completed'
     *   - completed_at must be set to now()
     *   - actual_hours must be recorded
     *
     * These three must always happen together atomically.
     * If we allowed status to be updated via updateTask()
     * completed_at and actual_hours might be missed.
     *
     * @throws ModelNotFoundException
     */
    public function completeTask(int $id, float $actualHours): Task
    {
        $task = Task::findOrFail($id);

        $task->update([
            'status'       => TaskStatus::Completed,
            'actual_hours' => $actualHours,
            'completed_at' => now(),
        ]);

        return $task->fresh();
    }

    /**
     * Delete a task.
     * SoftDeletes — not permanently removed.
     *
     * @throws ModelNotFoundException
     */
    public function deleteTask(int $id): void
    {
        Task::findOrFail($id)->delete();
    }

    /**
     * Get overdue tasks.
     * Used by UpdateOverdueTasksCommand scheduler.
     */
    public function getOverdueTasks(): \Illuminate\Database\Eloquent\Collection
    {
        return Task::query()
            ->whereNotIn('status', [TaskStatus::Completed->value, TaskStatus::Cancelled->value])
            ->whereNotNull('deadline')
            ->where('deadline', '<', now())
            ->with(['assignedTo'])
            ->get();
    }
}