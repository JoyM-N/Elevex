<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateInternRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdminOrAbove() ?? false;
    }

    public function rules(): array
    {
        $internId = (int) $this->route('user');

        return [
            'name'                  => ['sometimes', 'required', 'string', 'max:255'],
            'email'                 => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($internId),
            ],
            'phone'                 => ['nullable', 'string', 'max:30'],
            'is_active'             => ['sometimes', 'boolean'],
            'password'              => ['nullable', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'department'            => ['sometimes', 'required', 'string', 'max:255'],
            'university'            => ['nullable', 'string', 'max:255'],
            'student_id'            => ['nullable', 'string', 'max:100'],
            'start_date'            => ['sometimes', 'required', 'date'],
            'end_date'              => ['sometimes', 'required', 'date', 'after:start_date'],
            'supervisor_id'         => ['nullable', 'integer', 'exists:users,id'],
            'notes'                 => ['nullable', 'string'],
        ];
    }
}
