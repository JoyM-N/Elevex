<?php

namespace Database\Factories;

use App\Models\Evaluation;
use App\Models\Internship;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * EvaluationFactory
 *
 * Generates admin evaluation records for testing and seeding.
 * All scores are randomly generated between 1 and 5.
 *
 * Usage:
 *   Evaluation::factory()->create()
 *   Evaluation::factory()->excellent()->create()
 *   Evaluation::factory()->poor()->create()
 */
class EvaluationFactory extends Factory
{
    protected $model = Evaluation::class;

    public function definition(): array
    {
        return [
            'user_id'               => User::factory()->intern(),
            'internship_id'         => Internship::factory(),
            'evaluated_by'          => User::factory()->admin(),
            'communication_score'   => fake()->numberBetween(1, 5),
            'professionalism_score' => fake()->numberBetween(1, 5),
            'initiative_score'      => fake()->numberBetween(1, 5),
            'problem_solving_score' => fake()->numberBetween(1, 5),
            'teamwork_score'        => fake()->numberBetween(1, 5),
            'remarks'               => fake()->randomElement([
                'Strong communication and reliable delivery this cycle. Keep documenting blockers early.',
                'Good teamwork and initiative. Focus next on tightening estimate accuracy.',
                'Consistent progress overall. Encourage more proactive updates in standup notes.',
            ]),
        ];
    }

    /**
     * Create an excellent evaluation — all scores 5.
     */
    public function excellent(): static
    {
        return $this->state(fn() => [
            'communication_score'   => 5,
            'professionalism_score' => 5,
            'initiative_score'      => 5,
            'problem_solving_score' => 5,
            'teamwork_score'        => 5,
        ]);
    }

    /**
     * Create a poor evaluation — all scores 1.
     */
    public function poor(): static
    {
        return $this->state(fn() => [
            'communication_score'   => 1,
            'professionalism_score' => 1,
            'initiative_score'      => 1,
            'problem_solving_score' => 1,
            'teamwork_score'        => 1,
        ]);
    }
}