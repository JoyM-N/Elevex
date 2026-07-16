<?php

namespace App\Policies;

use App\Models\Logbook;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class LogbookPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }


    public function view(User $user, Logbook $logbook): Response|bool
    {
        if ($user->isAdminOrAbove()) {
            return true;
        }

        if ($user->id !== $logbook->user_id) {
            return Response::deny(
                'This logbook belongs to another intern. List your own entries with GET /api/v1/intern/logbooks.'
            );
        }

        return true;
    }

    public function create(User $user): Response|bool
    {
        if ($user->isIntern()) {
            return true;
        }

        return Response::deny(
            'Only interns can create logbooks. Log in with an intern account and use POST /api/v1/intern/logbooks.'
        );
    }

    public function update(User $user, Logbook $logbook): Response|bool
    {
        if ($logbook->isLocked()) {
            return Response::deny('Approved logbooks are read-only and cannot be edited.');
        }

        if ($user->id !== $logbook->user_id) {
            return Response::deny('You can only update your own logbooks.');
        }

        return true;
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