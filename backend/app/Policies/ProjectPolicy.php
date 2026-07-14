<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

/**
 * ProjectPolicy
 *
 * Controls who can manage projects.
 *
 * Locking rule:
 *   Completed and Cancelled projects are read-only.
 *   No one can edit a locked project — not even super admin.
 *   This protects historical project data integrity.
 */
class ProjectPolicy
{

    public function viewAny(User $user): bool
    {
        return true; 
    }

    public function view(User $user, Project $project): bool
    {
        if ($user->isAdminOrAbove()) {
            return true;
        }
        return $project->members()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->isAdminOrAbove();
    }

    public function update(User $user, Project $project): bool
    {
        if ($project->isLocked()) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->isAdmin() && $user->id === $project->created_by;
    }

    public function delete(User $user, Project $project): bool
    {
        if ($project->isLocked()) {
            return false;
        }

        return $user->isSuperAdmin();
    }
    
    public function assignMembers(User $user, Project $project): bool
    {
        if ($project->isLocked()) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->isAdmin() && $user->id === $project->created_by;
    }
}