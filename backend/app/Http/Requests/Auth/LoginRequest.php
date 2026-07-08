<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * LoginRequest
 *
 * Validates incoming login credentials.
 * authorize() returns true because this is a public endpoint —
 * anyone can attempt to log in, we just validate their data first.
 */
class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Public endpoint — no auth check needed here
        return true;
    }

    public function rules(): array
    {
        return [
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'], // optional — stay logged in
        ];
    }
}