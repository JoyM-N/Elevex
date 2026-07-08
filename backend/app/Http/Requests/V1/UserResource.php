<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * UserResource
 *
 * Shapes the User model into a consistent API response.
 * We NEVER return raw Eloquent models from controllers.
 *
 * Why?
 * If you add a sensitive column to the User model tomorrow,
 * a raw model response would expose it immediately.
 * A Resource forces you to explicitly choose what gets exposed.
 *
 * Note:
 *   avatar_url returns a full URL not a path.
 *   The frontend should never need to construct URLs manually.
 */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'email'          => $this->email,
            'role'           => $this->role->value,
            'role_label'     => $this->role->label(),
            'phone'          => $this->phone,
            'avatar_url'     => $this->avatar_path
                                    ? asset('storage/' . $this->avatar_path)
                                    : null,
            'is_active'      => $this->is_active,
            'email_verified' => !is_null($this->email_verified_at),
            'created_at'     => $this->created_at->toISOString(),
        ];
    }
}