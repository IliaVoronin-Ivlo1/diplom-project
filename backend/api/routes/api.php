<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'service' => 'backend',
        'timestamp' => now()->timestamp
    ]);
});

Route::get('/test', function () {
    return response()->json([
        'message' => 'Тестовый маршрут работает',
        'data' => [
            'backend' => 'Laravel 11',
            'database' => 'Corstat',
            'services' => [
                'supplier-rating-service' => 'Анализ поставщиков',
                'parts-matching-service' => 'Подбор запчастей',
                'price-analysis-service' => 'Анализ цен',
                'quality-control-service' => 'Контроль качества'
            ]
        ],
        'timestamp' => now()->format('Y-m-d H:i:s')
    ]);
});

Route::post('/test', function (Request $request) {
    $data = $request->all();
    
    return response()->json([
        'message' => 'Данные получены',
        'received_data' => $data,
        'processed_at' => now()->format('Y-m-d H:i:s')
    ]);
});

