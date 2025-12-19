<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClusterController;
use App\Http\Controllers\GeneticAlgorithmController;
use App\Http\Controllers\ReverseGeneticAlgorithmController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SupplierOrdersStatisticsController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AlgorithmScheduleController;
use App\Http\Controllers\PriceForecastingController;
use App\Http\Controllers\AnalysisHistoryController;

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
    Route::post('/get-article-brand-suppliers', [ReverseGeneticAlgorithmController::class, 'getArticleBrandSuppliers']);
});

Route::middleware('auth:sanctum')->prefix('statistics')->group(function () {
    Route::get('/supplier-orders', [SupplierOrdersStatisticsController::class, 'getSupplierOrdersStatistics']);
});

Route::middleware(['auth:sanctum', 'role:Admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'getUsers']);
    Route::put('/users/{userId}', [AdminController::class, 'updateUser']);
    Route::get('/algorithm-schedules', [AlgorithmScheduleController::class, 'getSchedules']);
    Route::put('/algorithm-schedules/{algorithmType}', [AlgorithmScheduleController::class, 'updateSchedule']);
    Route::get('/analysis-history', [AnalysisHistoryController::class, 'getHistory']);
});

Route::middleware('auth:sanctum')->prefix('price-forecasting')->group(function () {
    Route::get('/article-brand-list', [PriceForecastingController::class, 'getArticleBrandList']);
    Route::post('/seasonality', [PriceForecastingController::class, 'getSeasonalityData']);
    Route::post('/forecast', [PriceForecastingController::class, 'getForecastData']);
});

