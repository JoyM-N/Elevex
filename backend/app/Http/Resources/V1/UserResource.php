<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;


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
            'team_role'      => $this->when(
                $this->pivot?->team_role !== null,
                $this->pivot?->team_role
            ),
            'created_at'     => $this->created_at->toISOString(),
        ];
    }
}