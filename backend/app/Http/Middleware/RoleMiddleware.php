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

        $allowedRoles = array_map(
            fn(string $role) => UserRole::from($role),
            $roles
        );

        if (!in_array($user->role, $allowedRoles)) {
            return $this->forbidden(
                'You do not have permission to access this resource.'
            );
        }
        return $next($request);
    }
}