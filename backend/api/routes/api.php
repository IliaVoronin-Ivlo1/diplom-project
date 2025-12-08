<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClusterController;
use App\Http\Controllers\GeneticAlgorithmController;
use App\Http\Controllers\ReverseGeneticAlgorithmController;
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
    Route::get('/get-clusters-data', [ClusterController::class, 'getClustersData']);
});

Route::middleware('auth:sanctum')->prefix('genetic-algorithm')->group(function () {
    Route::get('/get-results-data', [GeneticAlgorithmController::class, 'getResultsData']);
    Route::get('/get-supplier-combinations/{supplierId}', [GeneticAlgorithmController::class, 'getSupplierCombinations']);
});

Route::middleware('auth:sanctum')->prefix('reverse-genetic-algorithm')->group(function () {
    Route::get('/get-results-data', [ReverseGeneticAlgorithmController::class, 'getResultsData']);
    Route::get('/get-article-brand-suppliers/{article}/{brand}', [ReverseGeneticAlgorithmController::class, 'getArticleBrandSuppliers']);
});

