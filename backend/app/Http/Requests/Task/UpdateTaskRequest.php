<?php

namespace App\Http\Requests\Task;

use App\Enums\ProjectPriority;
use App\Enums\TaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * UpdateTaskRequest
 *
 * Validates incoming data when updating a task.
 * All fields are optional (sometimes) — only send what changed.
 */
class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        $task = \App\Models\Task::findOrFail($this->route('task'));

        return $this->user()->can('update', $task);
    }

    public function rules(): array
    {
        return [
            'title'           => ['sometimes', 'string', 'max:255'],
            'description'     => ['nullable', 'string'],
            'priority'        => ['sometimes', Rule::enum(ProjectPriority::class)],
            'status'          => ['sometimes', Rule::enum(TaskStatus::class)],
            'estimated_hours' => ['nullable', 'numeric', 'min:0.5', 'max:999'],
            'actual_hours'    => ['nullable', 'numeric', 'min:0.5', 'max:999'],
            'deadline'        => ['nullable', 'date'],
        ];
    }
}