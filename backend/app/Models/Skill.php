<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Skill Model
 *
 * Represents a single skill in the master skills list.
 * Seeded with common technical and soft skills.
 * Admins can add new skills via the UI.
 *
 * Two categories:
 *   technical — Laravel, React, Docker, MySQL, Git etc.
 *   soft      — Communication, Leadership, Problem Solving etc.
 *
 * Why a separate table instead of storing skills on users?
 * Because skills are reusable across many interns.
 * Storing them on users would mean:
 *   - Duplicated data ("Laravel" stored 50 times for 50 interns)
 *   - No way to query "how many interns know Laravel?"
 *   - No consistent naming (one intern writes "laravel",
 *     another writes "Laravel Framework")
 *
 * A separate skills table with a pivot gives us:
 *   - One canonical "Laravel" entry
 *   - Query all interns with that skill
 *   - Track proficiency level per intern per skill
 *   - Admin endorsement of proficiency
 *
 * Relationships:
 *   users — all interns who have this skill
 *           pivot carries proficiency_level and endorsement data
 */
class Skill extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
    ];

    // =========================================================
    // Helper Methods
    // =========================================================

    /**
     * Is this a technical skill?
     * e.g. Laravel, Docker, React
     */
    public function isTechnical(): bool
    {
        return $this->category === 'technical';
    }

    /**
     * Is this a soft skill?
     * e.g. Communication, Leadership
     */
    public function isSoft(): bool
    {
        return $this->category === 'soft';
    }

    // =========================================================
    // Relationships
    // =========================================================

    /**
     * All interns who have this skill.
     * The pivot table carries:
     *   proficiency_level — beginner, intermediate, advanced, expert
     *   endorsed_by       — admin who verified the proficiency
     *   endorsed_at       — when it was endorsed
     *
     * Usage:
     *   $skill->users                            — all interns with this skill
     *   $skill->users->first()->pivot->proficiency_level — their level
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_skills')
            ->withPivot(['proficiency_level', 'endorsed_by', 'endorsed_at'])
            ->withTimestamps();
    }
}