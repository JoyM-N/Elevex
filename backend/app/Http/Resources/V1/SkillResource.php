<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * SkillResource
 *
 * Shapes the Skill model into a consistent API response.
 *
 * Pivot fields (proficiency_level, endorsed_by, endorsed_at)
 * are only present when loaded via user skills relationship.
 */
class SkillResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'       => $this->id,
            'name'     => $this->name,
            'category' => $this->category,

            // Only present when loaded via user skills relationship
            'proficiency_level' => $this->whenPivotLoaded('user_skills', function () {
                return $this->pivot->proficiency_level;
            }),
            'endorsed_by' => $this->whenPivotLoaded('user_skills', function () {
                return $this->pivot->endorsed_by;
            }),
            'endorsed_at' => $this->whenPivotLoaded('user_skills', function () {
                return $this->pivot->endorsed_at;
            }),
        ];
    }
}