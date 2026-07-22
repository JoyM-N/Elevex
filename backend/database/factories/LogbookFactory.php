<?php

namespace Database\Factories;

use App\Enums\LogbookStatus;
use App\Models\Logbook;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * LogbookFactory
 *
 * Generates daily logbook entries for testing and seeding.
 * Default state creates a submitted logbook.
 *
 * Usage:
 *   Logbook::factory()->create()
 *   Logbook::factory()->approved()->create()
 *   Logbook::factory()->rejected()->create()
 *   Logbook::factory()->draft()->create()
 */
class LogbookFactory extends Factory
{
    protected $model = Logbook::class;

    public function definition(): array
    {
        return [
            'user_id'          => User::factory()->intern(),
            'task_id'          => Task::factory(),
            'approved_by'      => null,
            'date'             => fake()->dateTimeBetween('-1 month', 'now'),
            'hours_worked'     => fake()->randomFloat(1, 1, 8),
            'description'      => fake()->randomElement([
                'Made steady progress on the assigned task and checked the main user flows.',
                'Implemented the planned changes, tested locally, and noted remaining edge cases.',
                'Collaborated with the team, resolved review comments, and updated task status.',
            ]),
            'blockers'         => fake()->optional()->randomElement([
                'Waiting on design confirmation for one screen.',
                'Need access credentials for the staging environment.',
                null,
            ]),
            'learning_outcome' => fake()->randomElement([
                'Improved debugging habits and clearer status updates.',
                'Got more comfortable breaking work into smaller deliverables.',
                'Learned to surface blockers earlier in the day.',
            ]),
            'status'           => LogbookStatus::Submitted,
            'revision_note'    => null,
            'reviewed_at'      => null,
        ];
    }

    /**
     * Create a draft logbook — saved but not submitted.
     */
    public function draft(): static
    {
        return $this->state(fn() => [
            'status' => LogbookStatus::Draft,
        ]);
    }

    /**
     * Create an approved logbook.
     * Sets approved_by and reviewed_at automatically.
     */
    public function approved(): static
    {
        return $this->state(fn() => [
            'status'      => LogbookStatus::Approved,
            'approved_by' => User::factory()->admin(),
            'reviewed_at' => now(),
        ]);
    }

    /**
     * Create a rejected logbook with a revision note.
     */
    public function rejected(): static
    {
        return $this->state(fn() => [
            'status'        => LogbookStatus::Rejected,
            'approved_by'   => User::factory()->admin(),
            'revision_note' => fake()->sentence(),
            'reviewed_at'   => now(),
        ]);
    }

    /**
     * Create a logbook needing revision.
     */
    public function revisionNeeded(): static
    {
        return $this->state(fn() => [
            'status'        => LogbookStatus::RevisionNeeded,
            'approved_by'   => User::factory()->admin(),
            'revision_note' => fake()->sentence(),
            'reviewed_at'   => now(),
        ]);
    }
}