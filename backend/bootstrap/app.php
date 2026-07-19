<?php

use App\Console\Commands\CheckAchievementsCommand;
use App\Console\Commands\RecalculatePerformanceCommand;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;
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

        // Recalculate performance metrics for all interns every night at midnight
        $schedule->command(RecalculatePerformanceCommand::class)->dailyAt('00:00');

        // Check and award achievements after performance is recalculated
        // Runs at 1am so performance metrics are always fresh first
        $schedule->command(CheckAchievementsCommand::class)->dailyAt('01:00');

    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();