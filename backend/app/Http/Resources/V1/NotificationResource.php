<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * NotificationResource
 *
 * Shapes Laravel's DatabaseNotification model
 * into a consistent API response.
 *
 * The 'data' field contains the array from toDatabase()
 * in each Notification class.
 */
class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'type'       => $this->data['type'] ?? null,
            'message'    => $this->data['message'] ?? null,
            'data'       => $this->data,
            'read'       => !is_null($this->read_at),
            'read_at'    => $this->read_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}