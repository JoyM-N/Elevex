<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;


class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'email'          => $this->email,
            'role'           => $this->role->value,
            'role_label'     => $this->role->label(),
            'phone'          => $this->phone,
            'avatar_url'     => $this->avatar_path
                                    ? asset('storage/' . $this->avatar_path)
                                    : null,
            'is_active'      => $this->is_active,
            'email_verified' => !is_null($this->email_verified_at),
            'team_role'      => $this->when(
                $this->pivot?->team_role !== null,
                $this->pivot?->team_role
            ),
            'active_internship' => $this->whenLoaded('activeInternship', function () {
                if (!$this->activeInternship) {
                    return null;
                }

                $supervisor = null;
                if (
                    $this->activeInternship->relationLoaded('supervisor')
                    && $this->activeInternship->supervisor
                ) {
                    $supervisor = [
                        'id'    => $this->activeInternship->supervisor->id,
                        'name'  => $this->activeInternship->supervisor->name,
                        'email' => $this->activeInternship->supervisor->email,
                    ];
                }

                return [
                    'id'         => $this->activeInternship->id,
                    'department' => $this->activeInternship->department,
                    'university' => $this->activeInternship->university,
                    'student_id' => $this->activeInternship->student_id,
                    'start_date' => $this->activeInternship->start_date->toDateString(),
                    'end_date'   => $this->activeInternship->end_date->toDateString(),
                    'status'     => $this->activeInternship->status->value,
                    'notes'      => $this->activeInternship->notes,
                    'supervisor' => $supervisor,
                ];
            }),
            'internships' => $this->whenLoaded('internships', function () {
                return $this->internships->map(function ($internship) {
                    $supervisor = null;
                    if ($internship->relationLoaded('supervisor') && $internship->supervisor) {
                        $supervisor = [
                            'id'    => $internship->supervisor->id,
                            'name'  => $internship->supervisor->name,
                            'email' => $internship->supervisor->email,
                        ];
                    }

                    return [
                        'id'         => $internship->id,
                        'department' => $internship->department,
                        'university' => $internship->university,
                        'student_id' => $internship->student_id,
                        'start_date' => $internship->start_date->toDateString(),
                        'end_date'   => $internship->end_date->toDateString(),
                        'status'     => $internship->status->value,
                        'notes'      => $internship->notes,
                        'supervisor' => $supervisor,
                    ];
                })->values();
            }),
            'created_at'     => $this->created_at->toISOString(),
        ];
    }
}