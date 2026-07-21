<?php

namespace Database\Seeders;

use App\Models\PublicHoliday;
use Illuminate\Database\Seeder;

/**
 * PublicHolidaySeeder
 *
 * Seeds Kenyan public holidays for 2026.
 * Run annually to add the next year's holidays.
 *
 * Source: Kenya Government official public holidays
 */
class PublicHolidaySeeder extends Seeder
{
    public function run(): void
    {
        $holidays = [
            ['date' => '2026-01-01', 'name' => "New Year's Day"],
            ['date' => '2026-04-03', 'name' => 'Good Friday'],
            ['date' => '2026-04-06', 'name' => 'Easter Monday'],
            ['date' => '2026-05-01', 'name' => 'Labour Day'],
            ['date' => '2026-06-01', 'name' => 'Madaraka Day'],
            ['date' => '2026-10-10', 'name' => 'Huduma Day'],
            ['date' => '2026-10-20', 'name' => 'Mashujaa Day'],
            ['date' => '2026-12-12', 'name' => 'Jamhuri Day'],
            ['date' => '2026-12-25', 'name' => 'Christmas Day'],
            ['date' => '2026-12-26', 'name' => 'Boxing Day'],
        ];

        foreach ($holidays as $holiday) {
            PublicHoliday::firstOrCreate(
                ['date' => $holiday['date']],
                [
                    'name'    => $holiday['name'],
                    'country' => 'KE',
                ]
            );
        }

        $this->command->info('Kenyan public holidays seeded for 2026.');
    }
}