<?php

use App\Http\Controllers\Api\Intern\LogbookController;
use App\Http\Controllers\Api\Intern\TaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Intern Routes
|--------------------------------------------------------------------------
*/

Route::get('/dashboard', function () {
    return response()->json([
        'success' => true,
        'message' => 'Intern dashboard.',
    ]);
});

// Tasks
Route::get('tasks', [TaskController::class, 'index']);
Route::get('tasks/{task}', [TaskController::class, 'show']);
Route::patch('tasks/{task}/complete', [TaskController::class, 'complete']);

// Logbooks
Route::apiResource('logbooks', LogbookController::class);
// Route::get('logbooks', [LogbookController::class, 'index']);
Route::patch('logbooks/{logbook}/submit', [LogbookController::class, 'submit']);
Route::post('logbooks/{logbook}/files', [LogbookController::class, 'uploadFile']);
Route::post('logbooks/{logbook}/comments', [LogbookController::class, 'addComment']);