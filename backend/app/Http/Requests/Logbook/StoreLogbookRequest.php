<?php

namespace App\Http\Requests\Logbook;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreLogbookRequest
 *
 * Validates when an intern creates a new logbook entry.
 * Only interns can create logbooks — enforced via Policy.
 *
 * date: the day the work was done, not when it's submitted.
 * hours_worked: decimal to support half hours e.g. 2.5
 * task_id: must exist in tasks table and be assigned to this intern
 *          — cross-field validation done in LogbookService
 */
class StoreLogbookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Logbook::class);
    }

    public function rules(): array
    {
        return [
            'task_id'          => ['required', 'integer', 'exists:tasks,id'],
            'date'             => ['required', 'date', 'before_or_equal:today'],
            'hours_worked'     => ['required', 'numeric', 'min:0.5', 'max:24'],
            'description'      => ['required', 'string', 'min:10'],
            'blockers'         => ['nullable', 'string'],
            'learning_outcome' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'date.before_or_equal' => 'You cannot log work for a future date.',
            'description.min'      => 'Description must be at least 10 characters.',
        ];
    }
}