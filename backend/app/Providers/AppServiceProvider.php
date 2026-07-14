<?php

namespace App\Providers;

use App\Models\Evaluation;
use App\Models\Internship;
use App\Models\Logbook;
use App\Models\Project;
use App\Models\RecommendationLetter;
use App\Models\Task;
use App\Models\User;
use App\Policies\EvaluationPolicy;
use App\Policies\InternshipPolicy;
use App\Policies\LogbookPolicy;
use App\Policies\ProjectPolicy;
use App\Policies\RecommendationLetterPolicy;
use App\Policies\TaskPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider;
use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends AuthServiceProvider
{
  
    protected $policies = [
        User::class                 => UserPolicy::class,
        Internship::class           => InternshipPolicy::class,
        Project::class              => ProjectPolicy::class,
        Task::class                 => TaskPolicy::class,
        Logbook::class              => LogbookPolicy::class,
        Evaluation::class           => EvaluationPolicy::class,
        RecommendationLetter::class => RecommendationLetterPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        //A Super Admin can do everything in the system.
        //This runs before any policy method is evaluated.
        Gate::before(function (User $user, string $ability) {
            if ($user->isSuperAdmin()) {
                return true;
            }
        });
    }
}