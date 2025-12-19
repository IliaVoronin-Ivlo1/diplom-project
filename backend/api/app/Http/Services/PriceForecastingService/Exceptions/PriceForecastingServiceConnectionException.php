<?php

namespace App\Http\Services\PriceForecastingService\Exceptions;

use Exception;

class PriceForecastingServiceConnectionException extends Exception
{
    public function render($request)
    {
        return response()->json([
            'success' => false,
            'message' => 'Ошибка подключения к сервису прогнозирования цен: ' . $this->getMessage()
        ], 503);
    }
}

