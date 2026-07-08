<?php

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;

/**
 * SkillSeeder
 *
 * Seeds the master skills list with common technical and soft skills.
 * Uses firstOrCreate so running multiple times never creates duplicates.
 * Admins can add more skills via the UI after this initial seed.
 */
class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $technical = [
            'Laravel', 'PHP', 'Next.js', 'React', 'TypeScript',
            'JavaScript', 'Vue.js', 'MySQL', 'PostgreSQL', 'Redis',
            'Docker', 'Git', 'REST API', 'GraphQL', 'Tailwind CSS',
            'Node.js', 'Python', 'Linux', 'AWS', 'CI/CD',
        ];

        $soft = [
            'Communication', 'Teamwork', 'Problem Solving', 'Leadership',
            'Time Management', 'Critical Thinking', 'Adaptability', 'Initiative',
        ];

        foreach ($technical as $skill) {
            Skill::firstOrCreate(
                ['name' => $skill],
                ['category' => 'technical']
            );
        }

        foreach ($soft as $skill) {
            Skill::firstOrCreate(
                ['name' => $skill],
                ['category' => 'soft']
            );
        }

        $this->command->info('Skills seeded: ' . count($technical) . ' technical, ' . count($soft) . ' soft.');
    }
}