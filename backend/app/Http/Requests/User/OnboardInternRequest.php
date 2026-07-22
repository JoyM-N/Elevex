<?php

namespace App\Http\Requests\User;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class OnboardInternRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', User::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:255'],
            'email'         => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'      => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'phone'         => ['nullable', 'string', 'max:30'],
            'department'    => ['required', 'string', 'max:255'],
            'university'    => ['nullable', 'string', 'max:255'],
            'student_id'    => ['nullable', 'string', 'max:100'],
            'start_date'    => ['required', 'date'],
            'end_date'      => ['required', 'date', 'after:start_date'],
            'supervisor_id' => ['nullable', 'integer', 'exists:users,id'],
            'notes'         => ['nullable', 'string'],
        ];
    }
}
