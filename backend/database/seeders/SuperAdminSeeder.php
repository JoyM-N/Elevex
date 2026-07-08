<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * SuperAdminSeeder
 *
 * Creates the default Super Admin account.
 * Uses firstOrCreate so running this seeder multiple times
 * never creates duplicate accounts.
 *
 * Default credentials (change immediately in production):
 *   Email:    superadmin@elevex.com
 *   Password: password
 */
class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'superadmin@elevex.com'],
            [
                'name'              => 'Super Admin',
                'password'          => Hash::make('password'),
                'role'              => UserRole::SuperAdmin,
                'is_active'         => true,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Super Admin created: superadmin@elevex.com / password');
        $this->command->warn('Change these credentials before any deployment.');
    }
}