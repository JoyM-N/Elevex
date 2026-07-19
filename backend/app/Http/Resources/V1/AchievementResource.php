<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * AchievementResource
 *
 * Shapes the Achievement model into a consistent API response.
 *
 * awarded_at: only present when loaded via user_achievements pivot.
 * This tells the frontend when the intern earned this achievement.
 */
class AchievementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'key'         => $this->key,
            'name'        => $this->name,
            'description' => $this->description,
            'icon'        => $this->icon,

            // Only present when loaded via user achievements relationship
            // e.g. $user->achievements — pivot carries awarded_at
            'awarded_at'  => $this->whenPivotLoaded('user_achievements', function () {
                return $this->pivot->awarded_at;
            }),
        ];
    }
}