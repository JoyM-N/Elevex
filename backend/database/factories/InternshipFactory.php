<?php

namespace Database\Factories;

use App\Enums\InternshipStatus;
use App\Models\Internship;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class InternshipFactory extends Factory
{
    protected $model = Internship::class;

    public function definition(): array
    {
        // Internship runs for 3 months — realistic duration
        $startDate = fake()->dateTimeBetween('-6 months', '-3 months');
        $endDate   = fake()->dateTimeBetween('-2 months', 'now');

        return [
            // Creates a new intern user if none provided
            'user_id'       => User::factory()->intern(),

            // Creates a new admin user as supervisor if none provided
            'supervisor_id' => User::factory()->admin(),

            'department'    => fake()->randomElement([
                'Software Engineering',
                'Data Science',
                'UI/UX Design',
                'DevOps',
                'Quality Assurance',
                'Product Management',
            ]),

            'university'    => fake()->randomElement([
                'University of Nairobi',
                'Strathmore University',
                'JKUAT',
                'KCA University',
                'Multimedia University',
            ]),

            'student_id'    => strtoupper(fake()->bothify('CS-####-???')),
            'start_date'    => $startDate,
            'end_date'      => $endDate,
            'status'        => InternshipStatus::Active,
            'notes'         => fake()->optional()->sentence(),
        ];
    }

    /**
     * Create a completed internship.
     */
    public function completed(): static
    {
        return $this->state(fn() => [
            'status'     => InternshipStatus::Completed,
            'start_date' => fake()->dateTimeBetween('-1 year', '-6 months'),
            'end_date'   => fake()->dateTimeBetween('-5 months', '-1 month'),
        ]);
    }

    /**
     * Create a terminated internship.
     */
    public function terminated(): static
    {
        return $this->state(fn() => [
            'status' => InternshipStatus::Terminated,
        ]);
    }
}