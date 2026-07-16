<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * InternSeeder
 *
 * Creates a default Intern account for API testing.
 *
 * Default credentials:
 *   Email:    intern@elevex.com
 *   Password: password
 */
class InternSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'intern@elevex.com'],
            [
                'name'              => 'Test Intern',
                'password'          => Hash::make('password'),
                'role'              => UserRole::Intern,
                'is_active'         => true,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Test Intern created: intern@elevex.com / password');
    }
}
