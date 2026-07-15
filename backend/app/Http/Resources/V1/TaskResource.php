<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * TaskResource
 *
 * Shapes the Task model into a consistent API response.
 * Replaces the stub created in Phase 5.
 */
class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'title'           => $this->title,
            'description'     => $this->description,
            'task_type'       => $this->task_type,
            'task_type_label' => $this->task_type,
            'status'          => $this->status,
            'status_label'    => $this->status,
            'priority'        => $this->priority,
            'priority_label'  => $this->priority,
            'estimated_hours' => $this->estimated_hours,
            'actual_hours'    => $this->actual_hours,
            'deadline'        => $this->deadline?->toDateString(),
            'completed_at'    => $this->completed_at?->toISOString(),
            'is_overdue'      => $this->isOverdue(),
            'is_terminal'     => $this->is_terminal,

            // Only included when relationship is loaded
            'assigned_to' => new UserResource($this->whenLoaded('assignedTo')),
            'created_by'  => new UserResource($this->whenLoaded('createdBy')),
            'milestone'   => new MilestoneResource($this->whenLoaded('milestone')),

            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}