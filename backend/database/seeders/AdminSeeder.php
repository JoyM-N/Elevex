<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * AdminSeeder
 *
 * Creates a default Admin account for local development.
 *
 * Default credentials:
 *   Email:    admin@elevex.com
 *   Password: password
 */
class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@elevex.com'],
            [
                'name'              => 'Demo Admin',
                'password'          => Hash::make('password'),
                'role'              => UserRole::Admin,
                'is_active'         => true,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Admin created: admin@elevex.com / password');
    }
}
