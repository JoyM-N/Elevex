<?php

namespace Database\Seeders;

use App\Enums\TeamRole;
use App\Models\Internship;
use App\Models\Logbook;
use App\Models\Milestone;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * DemoSeeder
 *
 * Creates a realistic demo environment for development.
 * Generates admins, interns, projects, milestones, tasks and logbooks
 * so the system has real data to work with immediately after setup.
 *
 * DO NOT run this in production.
 * This is purely for development and demonstration purposes.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Create 2 admins
        $admins = User::factory(2)->admin()->create();
        $this->command->info('Created 2 admins.');

        // Create 5 interns
        $interns = User::factory(5)->intern()->create();
        $this->command->info('Created 5 interns.');

        // Create an internship for each intern
        $interns->each(function ($intern) use ($admins) {
            Internship::factory()->create([
                'user_id'       => $intern->id,
                'supervisor_id' => $admins->random()->id,
            ]);
        });
        $this->command->info('Created 5 internships.');

        // Create 3 projects
        $projects = Project::factory(3)->create([
            'created_by' => $admins->first()->id,
        ]);
        $this->command->info('Created 3 projects.');

        // Assign interns to projects
        $projects->each(function ($project) use ($interns) {
            // Assign 2 random interns to each project
            $assignedInterns = $interns->random(2);

            $assignedInterns->each(function ($intern) use ($project) {
                $project->members()->attach($intern->id, [
                    'team_role' => TeamRole::FullStack->value,
                ]);
            });

            // Create 2 milestones per project
            $milestones = Milestone::factory(2)->create([
                'project_id' => $project->id,
            ]);

            // Create 3 tasks per milestone
            $milestones->each(function ($milestone) use ($assignedInterns) {
                $tasks = Task::factory(3)->create([
                    'milestone_id' => $milestone->id,
                    'assigned_to'  => $assignedInterns->random()->id,
                    'created_by'   => $milestone->project->created_by,
                ]);

                // Create 2 logbook entries per task
                $tasks->each(function ($task) {
                    Logbook::factory(2)->create([
                        'user_id' => $task->assigned_to,
                        'task_id' => $task->id,
                    ]);
                });
            });
        });

        $this->command->info('Created projects, milestones, tasks and logbooks.');
    }
}