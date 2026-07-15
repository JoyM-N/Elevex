<?php

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

// Tasks — interns can view their own and complete them
Route::get('tasks', [TaskController::class, 'index']);
Route::get('tasks/{task}', [TaskController::class, 'show']);
Route::patch('tasks/{task}/complete', [TaskController::class, 'complete']);