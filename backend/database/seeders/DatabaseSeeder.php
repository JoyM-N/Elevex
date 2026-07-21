<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * DatabaseSeeder
 *
 * Orchestrates all seeders in the correct order.
 * Order matters — SuperAdmin must exist before DemoSeeder runs.
 *
 * Commands:
 *   php artisan db:seed              — runs all seeders
 *   php artisan db:seed --class=DemoSeeder — runs one seeder only
 *   php artisan migrate:fresh --seed — fresh DB + all seeders
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Core data — always runs in all environments
        $this->call([
            SuperAdminSeeder::class,
            InternSeeder::class,
            SkillSeeder::class,
            AchievementSeeder::class,
        ]);

        $this->call([
            SuperAdminSeeder::class,
            SkillSeeder::class,
            AchievementSeeder::class,
            PublicHolidaySeeder::class, // ← add this line
        ]);

        // Demo data — only in development
        // Remove DemoSeeder from this list before deploying to production
        if (app()->environment('local')) {
            $this->call([
                DemoSeeder::class,
            ]);
        }
    }
}