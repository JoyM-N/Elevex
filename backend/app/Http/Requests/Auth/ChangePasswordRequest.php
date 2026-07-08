<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

/**
 * ChangePasswordRequest
 *
 * Validates a password change for an already authenticated user.
 * Requires the current password for verification — this prevents
 * someone from changing a password on an unattended logged-in session.
 */
class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Any authenticated user can change their own password
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'password'         => [
                'required',
                'confirmed',
                Password::min(8)->mixedCase()->numbers(),
            ],
        ];
    }
}