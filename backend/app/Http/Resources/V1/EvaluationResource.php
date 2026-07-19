<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * EvaluationResource
 *
 * Shapes the Evaluation model into a consistent API response.
 *
 * Includes computed fields:
 *   average_score            — average of all 5 dimensions (1-5 scale)
 *   average_score_percentage — converted to 0-100 percentage
 *
 * These are computed by methods on the Evaluation model
 * so the frontend never needs to calculate them.
 */
class EvaluationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                     => $this->id,
            'communication_score'    => $this->communication_score,
            'professionalism_score'  => $this->professionalism_score,
            'initiative_score'       => $this->initiative_score,
            'problem_solving_score'  => $this->problem_solving_score,
            'teamwork_score'         => $this->teamwork_score,
            'remarks'                => $this->remarks,

            // Computed fields — calculated by Evaluation model methods
            'average_score'            => $this->averageScore(),
            'average_score_percentage' => $this->averageScoreAsPercentage(),

            // Relationships — only when loaded
            'user'         => new UserResource($this->whenLoaded('user')),
            'internship'   => $this->whenLoaded('internship'),
            'evaluated_by' => new UserResource($this->whenLoaded('evaluatedBy')),

            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}