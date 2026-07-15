<?php

namespace App\Http\Requests\Project;

use App\Enums\TeamRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignMembersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('assignMembers', $this->route('project'));
    }

    public function rules(): array
    {
        return [
            'members'             => ['required', 'array', 'min:1'],
            'members.*.user_id'   => ['required', 'integer', 'exists:users,id'],
            'members.*.team_role' => ['required', Rule::enum(TeamRole::class)],
        ];
    }
}