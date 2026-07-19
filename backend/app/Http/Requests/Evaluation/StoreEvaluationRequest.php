<?php

namespace App\Http\Requests\Evaluation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * StoreEvaluationRequest
 *
 * Validates when an admin creates an evaluation for an intern.
 * All scores must be between 1 and 5.
 */
class StoreEvaluationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Evaluation::class);
    }

    public function rules(): array
    {
        return [
            'user_id'               => ['required', 'integer', 'exists:users,id'],
            'internship_id'         => ['required', 'integer', 'exists:internships,id'],
            'communication_score'   => ['required', 'integer', 'min:1', 'max:5'],
            'professionalism_score' => ['required', 'integer', 'min:1', 'max:5'],
            'initiative_score'      => ['required', 'integer', 'min:1', 'max:5'],
            'problem_solving_score' => ['required', 'integer', 'min:1', 'max:5'],
            'teamwork_score'        => ['required', 'integer', 'min:1', 'max:5'],
            'remarks'               => ['nullable', 'string'],
        ];
    }
}