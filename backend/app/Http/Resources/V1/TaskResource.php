<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * TaskResource
 *
 * Stub — full implementation in Phase 6 (Tasks).
 * Defined here so MilestoneResource can reference it
 * without throwing class not found errors.
 */
class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'status'      => $this->status->value,
            'priority'    => $this->priority->value,
            'deadline'    => $this->deadline?->toDateString(),
            'assigned_to' => $this->assigned_to,
        ];
    }
}