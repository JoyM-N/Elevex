<?php

namespace App\Http\Requests\SickDay;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * ReviewSickDayRequest
 *
 * Validates when an admin approves or rejects a sick day request.
 */
class ReviewSickDayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdminOrAbove();
    }

    public function rules(): array
    {
        return [
            'action' => ['required', Rule::in(['approved', 'rejected'])],
            'notes'  => ['nullable', 'string', 'max:500'],
        ];
    }
}