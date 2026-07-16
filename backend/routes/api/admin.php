<?php

use App\Http\Controllers\Api\Admin\LogbookController;
use App\Http\Controllers\Api\Admin\MilestoneController;
use App\Http\Controllers\Api\Admin\ProjectController;
use App\Http\Controllers\Api\Admin\TaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::get('/dashboard', function () {
    return response()->json([
        'success' => true,
        'message' => 'Admin dashboard.',
    ]);
});

// Projects
Route::apiResource('projects', ProjectController::class);
Route::post('projects/{project}/members', [ProjectController::class, 'assignMembers']);
Route::delete('projects/{project}/members/{user}', [ProjectController::class, 'removeMember']);

// Milestones nested under projects
Route::apiResource('projects.milestones', MilestoneController::class);

// Tasks
Route::apiResource('tasks', TaskController::class);

// Logbooks
Route::get('logbooks', [LogbookController::class, 'index']);
Route::get('logbooks/{logbook}', [LogbookController::class, 'show']);
Route::patch('logbooks/{logbook}/review', [LogbookController::class, 'review']);
Route::post('logbooks/{logbook}/comments', [LogbookController::class, 'addComment']);