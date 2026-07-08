<?php

namespace Database\Factories;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * ProjectFactory
 *
 * Generates realistic project data for testing and seeding.
 * Default state creates an active project.
 *
 * Usage:
 *   Project::factory()->create()
 *   Project::factory()->completed()->create()
 *   Project::factory()->for($admin, 'createdBy')->create()
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-3 months', '-1 month');
        $endDate   = fake()->dateTimeBetween('now', '+3 months');

        return [
            'title'       => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'status'      => ProjectStatus::Active,
            'priority'    => fake()->randomElement(ProjectPriority::values()),
            'start_date'  => $startDate,
            'end_date'    => $endDate,
            'created_by'  => User::factory()->admin(),
        ];
    }

    public function planning(): static
    {
        return $this->state(fn() => [
            'status' => ProjectStatus::Planning,
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn() => [
            'status'     => ProjectStatus::Completed,
            'start_date' => fake()->dateTimeBetween('-6 months', '-4 months'),
            'end_date'   => fake()->dateTimeBetween('-3 months', '-1 month'),
        ]);
    }

    public function onHold(): static
    {
        return $this->state(fn() => [
            'status' => ProjectStatus::OnHold,
        ]);
    }
}