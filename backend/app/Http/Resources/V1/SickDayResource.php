<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * SickDayResource
 *
 * Shapes the SickDay model into a consistent API response.
 */
class SickDayResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'date'        => $this->date->toDateString(),
            'reason'      => $this->reason,
            'status'      => $this->status,
            'admin_notes' => $this->admin_notes,
            'approved_at' => $this->approved_at?->toISOString(),

            // Only when loaded
            'user'        => new UserResource($this->whenLoaded('user')),
            'approved_by' => new UserResource($this->whenLoaded('approvedBy')),

            'created_at'  => $this->created_at->toISOString(),
        ];
    }
}