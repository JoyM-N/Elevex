<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * AuthenticationService
 *
 * Owns ALL authentication business logic in Elevex.
 * Controllers call one method here and return the result.
 * No auth logic ever leaks into controllers.
 *
 * Methods:
 *   login()             — validate credentials, establish session
 *   logout()            — invalidate session
 *   sendPasswordResetLink() — send reset email
 *   resetPassword()     — reset password using token
 *   changePassword()    — change password for authenticated user
 *
 * Why ValidationException for failed auth?
 * Because Laravel automatically converts ValidationException
 * into a 422 JSON response with the errors array.
 * This gives the frontend a consistent error format.
 */
class AuthenticationService
{
    /**
     * Authenticate user and establish session.
     *
     * Auth::attempt() does three things:
     *   1. Finds user by email
     *   2. Verifies password against hashed value using bcrypt
     *   3. Establishes the session (SPA mode — cookie based)
     *
     * We also check is_active — deactivated users cannot log in
     * even with correct credentials.
     *
     * Session regeneration after login prevents session fixation attacks —
     * a security vulnerability where an attacker sets a known session ID
     * before the user logs in then hijacks the authenticated session.
     *
     * @throws ValidationException
     */
    public function login(array $credentials, bool $remember = false): User
    {
        // Attempt authentication with email and password
        if (!Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();

        // Check if account is active — deactivated users cannot access the system
        if (!$user->is_active) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated. Please contact an administrator.'],
            ]);
        }

        // Regenerate session ID after successful login
        // Prevents session fixation attacks
        request()->session()->regenerate();

        return $user;
    }

    /**
     * Log out the authenticated user.
     *
     * Three steps:
     *   1. Auth::logout()              — clears the auth session
     *   2. session()->invalidate()     — destroys the entire session
     *   3. session()->regenerateToken() — generates new CSRF token
     *
     * All three are necessary for a clean, secure logout.
     * Skipping any of them leaves security vulnerabilities.
     */
    public function logout(): void
    {
        Auth::logout();

        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }

    /**
     * Send a password reset link to the given email address.
     *
     * Laravel's Password broker handles:
     *   - Generating a secure token
     *   - Storing the token in password_reset_tokens table
     *   - Sending the reset email
     *
     * We don't need to write any of that manually.
     *
     * @throws ValidationException
     */
    public function sendPasswordResetLink(string $email): void
    {
        $status = Password::sendResetLink(['email' => $email]);

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }
    }

    /**
     * Reset user password using the token from the reset email.
     *
     * Password::reset() handles:
     *   - Validating the token against password_reset_tokens table
     *   - Calling our callback if valid
     *   - Deleting the used token after reset
     *
     * Inside the callback we:
     *   - Hash the new password
     *   - Regenerate remember_token for security
     *   - Fire PasswordReset event (Laravel uses this internally)
     *
     * @throws ValidationException
     */
    public function resetPassword(array $data): void
    {
        $status = Password::reset(
            $data,
            function (User $user, string $password) {
                $user->forceFill([
                    'password'       => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Fire Laravel's built in PasswordReset event
                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }
    }

    /**
     * Change password for an already authenticated user.
     *
     * Unlike resetPassword() this requires the current password.
     * This is a security measure — prevents someone from changing
     * a password on an unattended logged in session.
     *
     * Steps:
     *   1. Verify current password matches what is stored
     *   2. Hash the new password
     *   3. Save to database
     *
     * @throws ValidationException
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): void
    {
        // Verify current password before allowing the change
        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($newPassword),
        ]);
    }
}