<?php

namespace App\Policies;

use App\Models\Evaluation;
use App\Models\User;

class EvaluationPolicy
{
 
    public function viewAny(User $user): bool
    {
        return $user->isAdminOrAbove();
    }

    public function view(User $user, Evaluation $evaluation): bool
    {
        if ($user->isAdminOrAbove()) {
            return true;
        }

        return $user->id === $evaluation->user_id;
    }

    public function create(User $user): bool
    {
        return $user->isAdminOrAbove();
    }

    public function update(User $user, Evaluation $evaluation): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->isAdmin() && $user->id === $evaluation->evaluated_by;
    }

    public function delete(User $user, Evaluation $evaluation): bool
    {
        return false;
    }
}