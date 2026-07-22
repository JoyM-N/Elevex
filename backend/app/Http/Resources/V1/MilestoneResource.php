<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MilestoneResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'project_id'            => $this->project_id,
            'title'                 => $this->title,
            'description'           => $this->description,
            'status'                => $this->status,
            'start_date'            => $this->start_date->toDateString(),
            'end_date'              => $this->end_date->toDateString(),
            'is_overdue'            => $this->isOverdue(),
            'completion_percentage' => $this->completionPercentage(),

            // Only included when relationship is loaded
            'tasks' => TaskResource::collection($this->whenLoaded('tasks')),
            'project' => $this->whenLoaded('project', fn () => [
                'id'    => $this->project->id,
                'title' => $this->project->title,
            ]),

            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}