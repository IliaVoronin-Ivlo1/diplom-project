<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WebSocketController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'service' => 'backend',
        'timestamp' => now()->timestamp
    ]);
});

Route::prefix('websocket')->group(function () {
    Route::post('/send', [WebSocketController::class, 'send']);
    Route::post('/broadcast', [WebSocketController::class, 'broadcast']);
    Route::post('/send-to-user', [WebSocketController::class, 'sendToUser']);
    Route::get('/stats', [WebSocketController::class, 'stats']);
    Route::get('/user/{userId}/online', [WebSocketController::class, 'checkUserOnline']);
});

