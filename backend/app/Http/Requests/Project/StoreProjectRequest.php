<?php

namespace App\Http\Requests\Project;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Delegates to ProjectPolicy@create
        // Only admins can create projects
        return $this->user()->can('create', \App\Models\Project::class);
    }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status'      => ['required', Rule::enum(ProjectStatus::class)],
            'priority'    => ['required', Rule::enum(ProjectPriority::class)],
            'start_date'  => ['required', 'date'],
            'end_date'    => ['required', 'date', 'after:start_date'],
        ];
    }
}