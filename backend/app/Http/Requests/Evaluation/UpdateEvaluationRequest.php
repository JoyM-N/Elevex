<?php

namespace App\Http\Requests\Evaluation;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateEvaluationRequest
 *
 * Validates when an admin updates an existing evaluation.
 * All fields are optional — only send what changed.
 */
class UpdateEvaluationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('evaluation'));
    }

    public function rules(): array
    {
        return [
            'communication_score'   => ['sometimes', 'integer', 'min:1', 'max:5'],
            'professionalism_score' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'initiative_score'      => ['sometimes', 'integer', 'min:1', 'max:5'],
            'problem_solving_score' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'teamwork_score'        => ['sometimes', 'integer', 'min:1', 'max:5'],
            'remarks'               => ['nullable', 'string'],
        ];
    }
}