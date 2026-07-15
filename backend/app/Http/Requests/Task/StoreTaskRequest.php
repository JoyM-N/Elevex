<?php

namespace App\Http\Requests\Task;

use App\Enums\ProjectPriority;
use App\Enums\TaskType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * StoreTaskRequest
 *
 * Validates incoming data when creating a task.
 *
 * Key rule:
 *   If task_type is 'project_task', milestone_id is required.
 *   If task_type is 'general_task', milestone_id must be absent.
 *   This is enforced via Laravel's required_if rule.
 */
class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Task::class);
    }

    public function rules(): array
    {
        return [
            'title'           => ['required', 'string', 'max:255'],
            'description'     => ['nullable', 'string'],
            'task_type'       => ['required', Rule::enum(TaskType::class)],
            'priority'        => ['required', Rule::enum(ProjectPriority::class)],
            'assigned_to'     => ['required', 'integer', 'exists:users,id'],
            'estimated_hours' => ['nullable', 'numeric', 'min:0.5', 'max:999'],
            'deadline'        => ['nullable', 'date'],

            // milestone_id required only when task_type is project_task
            'milestone_id' => [
                Rule::requiredIf(fn() => $this->task_type === TaskType::ProjectTask->value),
                'nullable',
                'integer',
                'exists:milestones,id',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'milestone_id.required' => 'A milestone is required for project tasks.',
        ];
    }
}