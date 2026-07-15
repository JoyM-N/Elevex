<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

/**
 * CompleteTaskRequest
 *
 * Validates when an intern marks a task as complete.
 * actual_hours is required — we need this for performance calculations.
 * Without actual_hours the PerformanceService cannot calculate
 * time efficiency metrics accurately.
 */
class CompleteTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('complete', $this->route('task'));
    }

    public function rules(): array
    {
        return [
            'actual_hours' => ['required', 'numeric', 'min:0.5', 'max:999'],
            'notes'        => ['nullable', 'string'],
        ];
    }
}