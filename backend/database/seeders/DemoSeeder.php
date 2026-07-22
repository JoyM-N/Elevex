<?php

namespace Database\Seeders;

use App\Enums\InternshipStatus;
use App\Enums\ProjectPriority;
use App\Enums\TeamRole;
use App\Enums\UserRole;
use App\Models\Evaluation;
use App\Models\Internship;
use App\Models\Logbook;
use App\Models\Milestone;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Services\PerformanceService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * DemoSeeder
 *
 * Local-only English demo data with completed work so performance
 * scores look realistic. Does not invent random admin accounts.
 *
 * DO NOT run this in production.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@elevex.com')->first()
            ?? User::factory()->admin()->create([
                'name'  => 'Demo Admin',
                'email' => 'admin@elevex.com',
            ]);

        $internBlueprints = [
            ['name' => 'Alice Njeri', 'email' => 'alice@elevex.com', 'department' => 'Software Engineering'],
            ['name' => 'Brian Otieno', 'email' => 'brian@elevex.com', 'department' => 'Data Science'],
            ['name' => 'Claire Wanjiku', 'email' => 'claire@elevex.com', 'department' => 'UI/UX Design'],
            ['name' => 'David Kamau', 'email' => 'david@elevex.com', 'department' => 'DevOps'],
            ['name' => 'Eva Mutua', 'email' => 'eva@elevex.com', 'department' => 'Quality Assurance'],
        ];

        $interns = collect($internBlueprints)->map(function (array $blueprint) {
            return User::firstOrCreate(
                ['email' => $blueprint['email']],
                [
                    'name'              => $blueprint['name'],
                    'password'          => Hash::make('password'),
                    'role'              => UserRole::Intern,
                    'is_active'         => true,
                    'email_verified_at' => now(),
                ]
            );
        });

        // Ensure the known test intern has an active internship too
        $testIntern = User::where('email', 'intern@elevex.com')->first();
        if ($testIntern) {
            $interns = $interns->prepend($testIntern)->unique('id')->values();
        }

        $internships = collect();
        $interns->each(function (User $intern) use ($admin, $internships, $internBlueprints) {
            $department = collect($internBlueprints)
                ->firstWhere('email', $intern->email)['department']
                ?? 'Software Engineering';

            $internship = Internship::firstOrCreate(
                [
                    'user_id' => $intern->id,
                    'status'  => InternshipStatus::Active,
                ],
                [
                    'supervisor_id' => $admin->id,
                    'department'    => $department,
                    'university'    => 'University of Nairobi',
                    'student_id'    => 'CS-'.str_pad((string) $intern->id, 4, '0', STR_PAD_LEFT).'-INT',
                    'start_date'    => now()->subMonths(2)->toDateString(),
                    'end_date'      => now()->addMonths(4)->toDateString(),
                    'notes'         => 'Active demo internship placement.',
                ]
            );
            $internships->put($intern->id, $internship);
        });

        $this->command->info('Created demo interns and internships.');

        $projectBlueprints = [
            [
                'title'       => 'Customer Support Portal',
                'description' => 'Build a self-service portal where customers can track tickets, view FAQs, and chat with support agents.',
                'milestones'  => [
                    [
                        'title' => 'Research and requirements',
                        'tasks' => [
                            ['title' => 'Map current support workflows', 'done' => true],
                            ['title' => 'Draft user stories for ticket tracking', 'done' => true],
                            ['title' => 'Review accessibility requirements', 'done' => false],
                        ],
                    ],
                    [
                        'title' => 'MVP build',
                        'tasks' => [
                            ['title' => 'Implement ticket list and filters', 'done' => true],
                            ['title' => 'Add FAQ search page', 'done' => true],
                            ['title' => 'Wire live chat widget', 'done' => false],
                        ],
                    ],
                ],
            ],
            [
                'title'       => 'Intern Performance Dashboard',
                'description' => 'Admin dashboard that surfaces completion rates, deadline adherence, and soft-skill evaluations for active interns.',
                'milestones'  => [
                    [
                        'title' => 'Metrics foundation',
                        'tasks' => [
                            ['title' => 'Define score weighting rules', 'done' => true],
                            ['title' => 'Build metrics recalculation job', 'done' => true],
                            ['title' => 'Add top performer widget', 'done' => false],
                        ],
                    ],
                    [
                        'title' => 'Reporting views',
                        'tasks' => [
                            ['title' => 'Create weekly performance report export', 'done' => true],
                            ['title' => 'Add evaluation summary cards', 'done' => true],
                            ['title' => 'Polish empty states and loading UI', 'done' => false],
                        ],
                    ],
                ],
            ],
            [
                'title'       => 'Onboarding Automation',
                'description' => 'Streamline intern onboarding with account creation, internship records, and welcome notifications in one flow.',
                'milestones'  => [
                    [
                        'title' => 'Account provisioning',
                        'tasks' => [
                            ['title' => 'Build admin onboard form validation', 'done' => true],
                            ['title' => 'Create user and internship atomically', 'done' => true],
                            ['title' => 'Send welcome email with login details', 'done' => false],
                        ],
                    ],
                    [
                        'title' => 'Profile completion',
                        'tasks' => [
                            ['title' => 'Add avatar upload endpoint', 'done' => true],
                            ['title' => 'Collect university and department fields', 'done' => true],
                            ['title' => 'Remind interns to finish profile setup', 'done' => false],
                        ],
                    ],
                ],
            ],
        ];

        $logbookLines = [
            'Worked through the assigned tickets and documented blockers for tomorrow.',
            'Completed the planned implementation and verified the happy-path flow.',
            'Paired with a teammate, cleaned up edge cases, and updated the task notes.',
            'Finished review feedback, wrote a short summary, and prepared the next steps.',
        ];

        foreach ($projectBlueprints as $projectData) {
            $project = Project::create([
                'title'       => $projectData['title'],
                'description' => $projectData['description'],
                'status'      => 'active',
                'priority'    => ProjectPriority::High->value,
                'start_date'  => now()->subMonths(2)->toDateString(),
                'end_date'    => now()->addMonths(2)->toDateString(),
                'created_by'  => $admin->id,
            ]);

            $assignedInterns = $interns->take(3);
            $assignedInterns->each(function (User $intern) use ($project) {
                $project->members()->syncWithoutDetaching([
                    $intern->id => ['team_role' => TeamRole::FullStack->value],
                ]);
            });

            foreach ($projectData['milestones'] as $milestoneData) {
                $milestone = Milestone::create([
                    'project_id'  => $project->id,
                    'title'       => $milestoneData['title'],
                    'description' => 'Demo milestone for '.$milestoneData['title'].'.',
                    'start_date'  => now()->subMonth()->toDateString(),
                    'end_date'    => now()->addMonth()->toDateString(),
                    'status'      => 'in_progress',
                ]);

                foreach ($milestoneData['tasks'] as $index => $taskData) {
                    $assignee = $assignedInterns[$index % $assignedInterns->count()];
                    $done = $taskData['done'];

                    $task = Task::factory()
                        ->{$done ? 'completed' : 'inProgress'}()
                        ->create([
                            'milestone_id' => $milestone->id,
                            'assigned_to'  => $assignee->id,
                            'created_by'   => $admin->id,
                            'title'        => $taskData['title'],
                            'description'  => 'Demo task: '.$taskData['title'].'. Focus on clear English deliverables and measurable progress.',
                            'deadline'     => now()->addDays(7)->toDateString(),
                            'completed_at' => $done ? now()->subDays(2) : null,
                            'priority'     => ProjectPriority::Medium->value,
                        ]);

                    foreach ([1, 2] as $dayOffset) {
                        Logbook::factory()->approved()->create([
                            'user_id'          => $assignee->id,
                            'task_id'          => $task->id,
                            'approved_by'      => $admin->id,
                            'date'             => now()->subDays($dayOffset)->toDateString(),
                            'description'      => $logbookLines[($index + $dayOffset) % count($logbookLines)],
                            'blockers'         => $done ? null : 'Waiting on design confirmation for one edge case.',
                            'learning_outcome' => 'Improved clarity around requirements and delivery pace.',
                            'hours_worked'     => 6.0,
                        ]);
                    }
                }
            }
        }

        $this->command->info('Created English projects, milestones, tasks, and logbooks.');

        $interns->each(function (User $intern) use ($admin, $internships) {
            $internship = $internships->get($intern->id);
            if (!$internship) {
                return;
            }

            Evaluation::factory()->create([
                'user_id'               => $intern->id,
                'internship_id'         => $internship->id,
                'evaluated_by'          => $admin->id,
                'communication_score'   => 4,
                'professionalism_score' => 5,
                'initiative_score'      => 4,
                'problem_solving_score' => 4,
                'teamwork_score'        => 5,
                'remarks'               => 'Solid progress this cycle. Keep documenting blockers early and share updates with the team.',
            ]);
        });

        $this->command->info('Created evaluations.');

        /** @var PerformanceService $performance */
        $performance = app(PerformanceService::class);
        $performance->recalculateAll();
        $this->command->info('Recalculated performance metrics.');
        $this->command->info('Logins (password for all): admin@elevex.com, intern@elevex.com, alice@elevex.com …');
    }
}
