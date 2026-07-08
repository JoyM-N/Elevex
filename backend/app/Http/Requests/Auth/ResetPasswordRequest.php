<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

/**
 * ResetPasswordRequest
 *
 * Validates the password reset form.
 * Requires the token from the reset email,
 * the user's email, and a strong new password.
 *
 * Password rules:
 *   min 8 characters
 *   must have mixed case
 *   must have at least one number
 */
class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token'    => ['required', 'string'],
            'email'    => ['required', 'string', 'email', 'exists:users,email'],
            'password' => [
                'required',
                'confirmed', // requires password_confirmation field to match
                Password::min(8)->mixedCase()->numbers(),
            ],
        ];
    }
}