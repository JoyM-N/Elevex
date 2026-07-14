<?php

namespace App\Policies;

use App\Models\RecommendationLetter;
use App\Models\User;


class RecommendationLetterPolicy
{
  
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, RecommendationLetter $letter): bool
    {
        if ($user->isAdminOrAbove()) {
            return true;
        }

        return $user->id === $letter->user_id;
    }

    public function create(User $user): bool
    {
        return $user->isIntern();
    }

    public function approve(User $user, RecommendationLetter $letter): bool
    {
        if (!$letter->isPending()) {
            return false;
        }

        return $user->isAdminOrAbove();
    }

    public function download(User $user, RecommendationLetter $letter): bool
    {
        if (!$letter->isApproved() || !$letter->hasPdf()) {
            return false;
        }

        return $user->id === $letter->user_id;
    }

    public function delete(User $user, RecommendationLetter $letter): bool
    {
        if (!$letter->isPending()) {
            return false;
        }

        return $user->isSuperAdmin();
    }
}