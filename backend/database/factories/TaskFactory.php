<?php

namespace Database\Factories;

use App\Enums\ProjectPriority;
use App\Enums\TaskStatus;
use App\Enums\TaskType;
use App\Models\Milestone;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * TaskFactory
 *
 * Generates task records for testing and seeding.
 * Default state creates a project task assigned to an intern.
 *
 * Usage:
 *   Task::factory()->create()
 *   Task::factory()->general()->create()
 *   Task::factory()->completed()->create()
 *   Task::factory()->overdue()->create()
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            'milestone_id'    => Milestone::factory(),
            'assigned_to'     => User::factory()->intern(),
            'created_by'      => User::factory()->admin(),
            'title'           => fake()->randomElement([
                'Write API endpoint tests',
                'Design empty-state layouts',
                'Fix login redirect for admins',
                'Document onboarding checklist',
                'Review pull request feedback',
                'Implement search and filters',
            ]),
            'description'     => fake()->randomElement([
                'Complete the assigned work with clear English notes and a short summary of blockers.',
                'Focus on the acceptance criteria, keep the branch clean, and update the task status.',
                'Ship a usable increment today and leave enough context for the next teammate.',
            ]),
            'task_type'       => TaskType::ProjectTask,
            'status'          => TaskStatus::Todo,
            'priority'        => fake()->randomElement(ProjectPriority::values()),
            'estimated_hours' => fake()->randomFloat(1, 1, 8),
            'actual_hours'    => null,
            'deadline'        => fake()->dateTimeBetween('now', '+1 month'),
            'completed_at'    => null,
        ];
    }

    /**
     * Create a general task not tied to any milestone.
     */
    public function general(): static
    {
        return $this->state(fn() => [
            'task_type'    => TaskType::GeneralTask,
            'milestone_id' => null,
        ]);
    }

    /**
     * Create a completed task.
     */
    public function completed(): static
    {
        return $this->state(fn() => [
            'status'       => TaskStatus::Completed,
            'actual_hours' => fake()->randomFloat(1, 1, 10),
            'completed_at' => now(),
        ]);
    }

    /**
     * Create an overdue task.
     */
    public function overdue(): static
    {
        return $this->state(fn() => [
            'status'   => TaskStatus::InProgress,
            'deadline' => fake()->dateTimeBetween('-1 month', '-1 day'),
        ]);
    }

    /**
     * Create an in progress task.
     */
    public function inProgress(): static
    {
        return $this->state(fn() => [
            'status' => TaskStatus::InProgress,
        ]);
    }
}