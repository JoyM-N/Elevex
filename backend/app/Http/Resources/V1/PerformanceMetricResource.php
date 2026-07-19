<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * PerformanceMetricResource
 *
 * Shapes the PerformanceMetric model into a consistent API response.
 *
 * grade: human readable label derived from overall_score.
 *   Excellent / Good / Satisfactory / Needs Improvement
 *   Calculated by PerformanceMetric@grade() method.
 */
class PerformanceMetricResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'completion_rate'  => $this->completion_rate,
            'deadline_score'   => $this->deadline_score,
            'consistency_score' => $this->consistency_score,
            'quality_score'    => $this->quality_score,
            'teamwork_score'   => $this->teamwork_score,
            'overall_score'    => $this->overall_score,

            // Human readable grade derived from overall_score
            'grade'            => $this->grade(),

            'calculated_at'    => $this->calculated_at->toISOString(),

            // Relationships — only when loaded
            'user'        => new UserResource($this->whenLoaded('user')),
            'internship'  => $this->whenLoaded('internship'),

            'created_at'  => $this->created_at->toISOString(),
            'updated_at'  => $this->updated_at->toISOString(),
        ];
    }
}