<?php

namespace App\Services;

use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

/**
 * SkillService
 *
 * Manages skill assignment and endorsement for interns.
 *
 * Key rules:
 *   - An intern can only have one proficiency level per skill
 *     enforced by unique constraint on user_skills table
 *   - Only admins can endorse a skill
 *   - Endorsement sets endorsed_by and endorsed_at
 */
class SkillService
{
    /**
     * Get all available skills.
     * Used to populate skill selection dropdowns.
     */
    public function getAllSkills(): Collection
    {
        return Skill::orderBy('category')->orderBy('name')->get();
    }

    /**
     * Get all skills for a specific intern.
     * Includes proficiency level and endorsement info.
     */
    public function getInternSkills(User $intern): Collection
    {
        return $intern->skills()->get();
    }

    /**
     * Assign a skill to an intern with a proficiency level.
     * If intern already has the skill, update their proficiency.
     *
     * @throws ValidationException
     */
    public function assignSkill(User $intern, int $skillId, string $proficiencyLevel): void
    {
        // Verify skill exists
        $skill = Skill::findOrFail($skillId);

        // syncWithoutDetaching adds or updates without removing others
        $intern->skills()->syncWithoutDetaching([
            $skillId => ['proficiency_level' => $proficiencyLevel],
        ]);
    }

    /**
     * Remove a skill from an intern.
     */
    public function removeSkill(User $intern, int $skillId): void
    {
        $intern->skills()->detach($skillId);
    }

    /**
     * Admin endorses an intern's skill proficiency.
     * Sets endorsed_by to the admin and endorsed_at to now.
     *
     * @throws ValidationException
     */
    public function endorseSkill(User $intern, int $skillId, User $admin): void
    {
        // Check intern actually has this skill
        $hasSkill = $intern->skills()->where('skill_id', $skillId)->exists();

        if (!$hasSkill) {
            throw ValidationException::withMessages([
                'skill_id' => ['This intern does not have this skill assigned.'],
            ]);
        }

        $intern->skills()->updateExistingPivot($skillId, [
            'endorsed_by'  => $admin->id,
            'endorsed_at'  => now(),
        ]);
    }
}