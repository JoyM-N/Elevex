<?php

use App\Console\Commands\CheckAchievementsCommand;
use App\Console\Commands\RecalculatePerformanceCommand;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;
use App\Console\Commands\ArchiveCompletedInternshipsCommand;
use App\Console\Commands\GenerateWeeklyReportsCommand;
use App\Console\Commands\UpdateOverdueTasksCommand;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        // Add session middleware to API routes
        // Required for Sanctum SPA cookie-based authentication
        $middleware->appendToGroup('api', [
            \Illuminate\Session\Middleware\StartSession::class,
        ]);

        // Register our custom role middleware
        $middleware->alias([
            'role' => RoleMiddleware::class,
        ]);

    })
    ->withSchedule(function (Schedule $schedule) {

        // Performance recalculation — every night at midnight
        $schedule->command(RecalculatePerformanceCommand::class)->dailyAt('00:00');
    
        // Achievement checks — after performance recalculation
        $schedule->command(CheckAchievementsCommand::class)->dailyAt('01:00');
    
        // Archive completed internships — nightly at 2am
        $schedule->command(ArchiveCompletedInternshipsCommand::class)->dailyAt('02:00');
    
        // Flag overdue tasks — every morning at 6am
        $schedule->command(UpdateOverdueTasksCommand::class)->dailyAt('06:00');
    
        // Weekly report — every Monday at 7am
        $schedule->command(GenerateWeeklyReportsCommand::class)->weeklyOn(1, '07:00');
    
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();