<?php

namespace App\Http\Requests\Skill;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * AssignSkillRequest
 *
 * Validates when a skill is assigned to an intern.
 * Used by both interns (self-assigning) and admins.
 */
class AssignSkillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Both admins and interns can assign skills
    }

    public function rules(): array
    {
        return [
            'skill_id'         => ['required', 'integer', 'exists:skills,id'],
            'proficiency_level' => [
                'required',
                Rule::in(['beginner', 'intermediate', 'advanced', 'expert']),
            ],
        ];
    }
}