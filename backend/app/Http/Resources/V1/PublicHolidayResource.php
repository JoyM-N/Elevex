<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * PublicHolidayResource
 *
 * Shapes the PublicHoliday model into a consistent API response.
 */
class PublicHolidayResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'date'       => $this->date->toDateString(),
            'name'       => $this->name,
            'country'    => $this->country,
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}