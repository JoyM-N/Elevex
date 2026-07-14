<?php

namespace App\Policies;

use App\Models\Internship;
use App\Models\User;

class InternshipPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdminOrAbove();
    }

    public function view(User $user, Internship $internship): bool
    {
        if ($user->isAdminOrAbove()) {
            return true;
        }

        return $user->id === $internship->user_id;
    }

    public function create(User $user): bool
    {
        return $user->isAdminOrAbove();
    }

  
    public function update(User $user, Internship $internship): bool
    {
        if ($internship->isTerminal()) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->isAdmin() && $user->id === $internship->supervisor_id;
    }

    public function delete(User $user, Internship $internship): bool
    {
        return false;
    }
}