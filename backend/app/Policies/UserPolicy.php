<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
 
    public function viewAny(User $user): bool
    {
        return $user->isAdminOrAbove();
    }

    public function view(User $user, User $model): bool
    {
        if ($user->isAdminOrAbove()) {
            return true;
        }
        return $user->id === $model->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdminOrAbove();
    }

    public function update(User $user, User $model): bool
    {
        if ($user->isAdminOrAbove()) {
            return true;
        }

        return $user->id === $model->id;
    }

    public function delete(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        return $user->isSuperAdmin();
    }
}