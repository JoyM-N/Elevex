<?php

namespace Database\Factories;

use App\Models\Milestone;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * MilestoneFactory
 *
 * Generates milestone records inside projects.
 * Default state creates a pending milestone.
 *
 * Usage:
 *   Milestone::factory()->create()
 *   Milestone::factory()->for($project)->create()
 *   Milestone::factory()->completed()->create()
 */
class MilestoneFactory extends Factory
{
    protected $model = Milestone::class;

    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-2 months', '-1 month');
        $endDate   = fake()->dateTimeBetween('now', '+2 months');

        return [
            'project_id'  => Project::factory(),
            'title'       => fake()->randomElement([
                'Discovery and planning',
                'Core feature build',
                'Quality and polish',
                'Launch readiness',
            ]),
            'description' => fake()->randomElement([
                'Define scope, owners, and success criteria before implementation starts.',
                'Deliver the main features needed for an usable internal release.',
                'Tighten edge cases, copy, and performance before handoff.',
            ]),
            'start_date'  => $startDate,
            'end_date'    => $endDate,
            'status'      => 'pending',
        ];
    }

    public function inProgress(): static
    {
        return $this->state(fn() => [
            'status' => 'in_progress',
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn() => [
            'status'     => 'completed',
            'start_date' => fake()->dateTimeBetween('-4 months', '-3 months'),
            'end_date'   => fake()->dateTimeBetween('-2 months', '-1 month'),
        ]);
    }
}