<?php

namespace App\Http\Requests\Skill;

use Illuminate\Foundation\Http\FormRequest;

/**
 * EndorseSkillRequest
 *
 * Validates when an admin endorses an intern's skill.
 * Only requires the skill_id — endorsed_by is set
 * automatically from the authenticated admin.
 */
class EndorseSkillRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Only admins can endorse skills
        return $this->user()->isAdminOrAbove();
    }

    public function rules(): array
    {
        return [
            'skill_id' => ['required', 'integer', 'exists:skills,id'],
        ];
    }
}