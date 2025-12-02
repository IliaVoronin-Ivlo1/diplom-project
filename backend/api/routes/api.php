<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/verify-email', [AuthController::class, 'verifyEmail']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });
});

Route::middleware('auth:sanctum')->prefix('profile')->group(function () {
    Route::put('/update-name', [ProfileController::class, 'updateName']);
    Route::post('/request-password-reset', [ProfileController::class, 'requestPasswordReset']);
});

Route::post('/auth/forgot-password', [ProfileController::class, 'forgotPassword']);
Route::post('/profile/reset-password', [ProfileController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->prefix('cluster')->group(function () {
    Route::get('/get-clusters-data', [\App\Http\Controllers\ClusterController::class, 'getClustersData']);
});

