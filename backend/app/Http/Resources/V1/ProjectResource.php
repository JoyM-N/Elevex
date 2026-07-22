<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'description' => $this->description,
            'status'      => $this->status->value,
            'status_label' => $this->status->label(),
            'priority'    => $this->priority->value,
            'priority_label' => $this->priority->label(),
            'start_date'  => $this->start_date->toDateString(),
            'end_date'    => $this->end_date->toDateString(),
            'is_locked'   => $this->isLocked(),
            'days_until_deadline' => $this->daysUntilDeadline(),

            // Present when loaded via belongsToMany (intern list) or set on show
            'my_team_role' => $this->when(
                $this->pivot?->team_role !== null || $this->my_team_role !== null,
                $this->pivot?->team_role ?? $this->my_team_role
            ),

            // Only included when relationship is loaded
            // e.g. Project::with('createdBy')->get()
            'created_by'  => new UserResource($this->whenLoaded('createdBy')),
            'members'     => UserResource::collection($this->whenLoaded('members')),
            'milestones'  => MilestoneResource::collection($this->whenLoaded('milestones')),

            'created_at'  => $this->created_at->toISOString(),
            'updated_at'  => $this->updated_at->toISOString(),
        ];
    }
}