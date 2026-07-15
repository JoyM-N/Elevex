<?php

use App\Http\Controllers\Api\Admin\MilestoneController;
use App\Http\Controllers\Api\Admin\ProjectController;
use Illuminate\Support\Facades\Route;
//Accessible by both Admin and Super Admin roles.
// Placeholder — Admin routes added per phase as features are built
Route::get('/dashboard', function () {
    return response()->json([
        'success' => true,
        'message' => 'Admin dashboard.',
        'data'    => [],
    ]);
});

// Projects
Route::apiResource('projects', ProjectController::class);

// Project member management
Route::post('projects/{project}/members', [ProjectController::class, 'assignMembers']);
Route::delete('projects/{project}/members/{user}', [ProjectController::class, 'removeMember']);

// Milestones — nested under projects
Route::apiResource('projects.milestones', MilestoneController::class);