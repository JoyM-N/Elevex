<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * ReportResource
 *
 * Shapes report data into a consistent API response.
 * Reports are not Eloquent models — they are plain arrays
 * built by Report Builders, so this resource wraps
 * the array data in our standard envelope.
 */
class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // $this->resource is the plain array from the builder
        return $this->resource;
    }
}