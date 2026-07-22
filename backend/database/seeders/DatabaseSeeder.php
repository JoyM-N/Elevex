<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * DatabaseSeeder
 *
 * Orchestrates all seeders in the correct order.
 *
 * Commands:
 *   php artisan db:seed
 *   php artisan migrate:fresh --seed
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SuperAdminSeeder::class,
            AdminSeeder::class,
            InternSeeder::class,
            SkillSeeder::class,
            AchievementSeeder::class,
            PublicHolidaySeeder::class,
        ]);

        // Demo data — local only
        if (app()->environment('local')) {
            $this->call([
                DemoSeeder::class,
            ]);
        }
    }
}
