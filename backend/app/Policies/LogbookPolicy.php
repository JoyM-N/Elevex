<?php

namespace App\Policies;

use App\Models\Logbook;
use App\Models\User;

/**
 * LogbookPolicy
 *
 * Controls who can manage logbook entries.
 *
 * Critical rule:
 *   Approved logbooks are permanently read-only.
 *   Once approved, no one — not even the admin who approved it
 *   or the super admin — can edit it.
 *   This protects the integrity of the audit trail.
 */
class LogbookPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }


    public function view(User $user, Logbook $logbook): bool
    {
        if ($user->isAdminOrAbove()) {
            return true;
        }

        return $user->id === $logbook->user_id;
    }

    public function create(User $user): bool
    {
        return $user->isIntern();
    }

    public function update(User $user, Logbook $logbook): bool
    {
        if ($logbook->isLocked()) {
            return false;
        }

        return $user->id === $logbook->user_id;
    }

    public function submit(User $user, Logbook $logbook): bool
    {
        if ($logbook->isLocked()) {
            return false;
        }

        return $user->id === $logbook->user_id;
    }

    public function review(User $user, Logbook $logbook): bool
    {
        if ($logbook->isLocked()) {
            return false;
        }

        return $user->isAdminOrAbove();
    }


    public function delete(User $user, Logbook $logbook): bool
    {
        if ($logbook->isLocked()) {
            return false;
        }

        return $user->id === $logbook->user_id;
    }
}