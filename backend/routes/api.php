<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    
    Route::get('/health', function () {
        return response()->json([
            'success' => true,
            'message' => 'Elevex API is running.',
            'version' => '1.0.0',
        ]);
    });

});