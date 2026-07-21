<?php

use App\Http\Controllers\Api\Intern\DashboardController;
use App\Http\Controllers\Api\Intern\LogbookController;
use App\Http\Controllers\Api\Intern\NotificationController;
use App\Http\Controllers\Api\Intern\PerformanceController;
use App\Http\Controllers\Api\Intern\RecommendationController;
use App\Http\Controllers\Api\Intern\SickDayController;
use App\Http\Controllers\Api\Intern\SkillController;
use App\Http\Controllers\Api\Intern\TaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Intern Routes
|--------------------------------------------------------------------------
*/

// Dashboard
Route::get('dashboard', [DashboardController::class, 'index']);

// Tasks
Route::get('tasks', [TaskController::class, 'index']);
Route::get('tasks/{task}', [TaskController::class, 'show']);
Route::patch('tasks/{task}/complete', [TaskController::class, 'complete']);

// Logbooks
Route::apiResource('logbooks', LogbookController::class)->except(['index']);
Route::get('logbooks', [LogbookController::class, 'index']);
Route::patch('logbooks/{logbook}/submit', [LogbookController::class, 'submit']);
Route::post('logbooks/{logbook}/files', [LogbookController::class, 'uploadFile']);
Route::post('logbooks/{logbook}/comments', [LogbookController::class, 'addComment']);

// Performance and Achievements
Route::get('performance', [PerformanceController::class, 'index']);
Route::get('achievements', [PerformanceController::class, 'achievements']);

// Skills
Route::get('skills', [SkillController::class, 'index']);
Route::get('skills/mine', [SkillController::class, 'mine']);
Route::post('skills', [SkillController::class, 'assign']);
Route::delete('skills/{skill}', [SkillController::class, 'remove']);

// Recommendation Letters
Route::get('recommendations', [RecommendationController::class, 'index']);
Route::post('recommendations', [RecommendationController::class, 'store']);
Route::get('recommendations/{letter}', [RecommendationController::class, 'show']);
Route::get('recommendations/{letter}/download', [RecommendationController::class, 'download']);

// Sick Days
Route::get('sick-days', [SickDayController::class, 'index']);
Route::post('sick-days', [SickDayController::class, 'store']);

// Notifications
Route::get('notifications', [NotificationController::class, 'index']);
Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead']);