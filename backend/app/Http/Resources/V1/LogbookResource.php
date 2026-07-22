<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * LogbookResource
 *
 * Shapes the Logbook model into a consistent API response.
 *
 * is_locked: tells the frontend whether to show edit buttons.
 *   Approved logbooks show read-only UI.
 *
 * Conditional relationships:
 *   Only included when eagerly loaded — prevents N+1 queries.
 */
class LogbookResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'date'             => $this->date->toDateString(),
            'hours_worked'     => $this->hours_worked,
            'description'      => $this->description,
            'blockers'         => $this->blockers,
            'learning_outcome' => $this->learning_outcome,
            'status'           => $this->status->value,
            'status_label'     => $this->status->label(),
            'revision_note'    => $this->revision_note,
            'reviewed_at'      => $this->reviewed_at?->toISOString(),

            // Frontend uses this to show/hide edit buttons
            'is_locked'        => $this->isLocked(),

            // Relationships — only when loaded
            'user'        => $this->whenLoaded(
                'user',
                fn () => new UserResource($this->user)
            ),
            'task'        => $this->whenLoaded(
                'task',
                fn () => new TaskResource($this->task)
            ),
            'approved_by' => $this->whenLoaded(
                'approvedBy',
                fn () => new UserResource($this->approvedBy)
            ),
            'comments'    => CommentResource::collection($this->whenLoaded('comments')),
            'files'       => FileUploadResource::collection($this->whenLoaded('fileUploads')),

            'created_at'  => $this->created_at?->toISOString(),
            'updated_at'  => $this->updated_at?->toISOString(),
        ];
    }
}