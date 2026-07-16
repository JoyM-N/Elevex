<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Traits\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    use ApiResponse;

    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return $this->unauthorized('Unauthenticated.');
        }

        // Super Admin can access any role-gated route (matches Gate::before).
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        $allowedRoles = array_map(
            fn(string $role) => UserRole::from($role),
            $roles
        );

        if (!in_array($user->role, $allowedRoles)) {
            $required = implode(' or ', $roles);

            return $this->forbidden(
                "This route requires the '{$required}' role. You are logged in as '{$user->role->value}'."
            );
        }
        return $next($request);
    }
}