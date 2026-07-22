<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LogbookSignoffResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'user_id'     => $this->user_id,
            'approved_at' => $this->approved_at?->toISOString(),
            'note'        => $this->note,
            'approved_by' => $this->whenLoaded(
                'approvedBy',
                fn () => new UserResource($this->approvedBy)
            ),
            'created_at'  => $this->created_at?->toISOString(),
        ];
    }
}
