<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Task $task): bool
    {
        if ($user->isAdminOrAbove()) {
            return true;
        }

        return $user->id === $task->assigned_to;
    }

    public function create(User $user): bool
    {
        return $user->isAdminOrAbove();
    }


    public function update(User $user, Task $task): bool
    {
        if ($task->isTerminal()) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->isAdmin() && $user->id === $task->created_by;
    }

    public function complete(User $user, Task $task): bool
    {
        if ($task->isTerminal()) {
            return false;
        }

        return $user->id === $task->assigned_to;
    }

    public function delete(User $user, Task $task): bool
    {
        if ($task->isTerminal()) {
            return false;
        }

        return $user->isSuperAdmin();
    }
}