<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * UserFactory
 *
 * Generates realistic fake user data for testing and seeding.
 * Default state creates an Intern — use role-specific methods
 * to create Admins and Super Admins.
 *
 * Usage:
 *   User::factory()->create()              — creates one intern
 *   User::factory()->admin()->create()     — creates one admin
 *   User::factory(10)->intern()->create()  — creates 10 interns
 *   User::factory()->unverified()->create() — unverified email
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    /**
     * Default state — creates an active, verified Intern.
     */
    public function definition(): array
    {
        return [
            'name'              => fake()->name(),
            'email'             => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password'          => Hash::make('password'), // default password for all seeded users
            'role'              => UserRole::Intern,
            'phone'             => fake()->phoneNumber(),
            'avatar_path'       => null,
            'is_active'         => true,
            'remember_token'    => Str::random(10),
        ];
    }

    /**
     * Create a Super Admin user.
     *
     * Usage: User::factory()->superAdmin()->create()
     */
    public function superAdmin(): static
    {
        return $this->state(fn() => [
            'role' => UserRole::SuperAdmin,
        ]);
    }

    /**
     * Create an Admin user.
     *
     * Usage: User::factory()->admin()->create()
     */
    public function admin(): static
    {
        return $this->state(fn() => [
            'role' => UserRole::Admin,
        ]);
    }

    /**
     * Create an Intern user.
     *
     * Usage: User::factory()->intern()->create()
     */
    public function intern(): static
    {
        return $this->state(fn() => [
            'role' => UserRole::Intern,
        ]);
    }

    /**
     * Create a user with unverified email.
     * Useful for testing email verification flow.
     *
     * Usage: User::factory()->unverified()->create()
     */
    public function unverified(): static
    {
        return $this->state(fn() => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create an inactive user.
     * Useful for testing deactivated account behavior.
     *
     * Usage: User::factory()->inactive()->create()
     */
    public function inactive(): static
    {
        return $this->state(fn() => [
            'is_active' => false,
        ]);
    }
}