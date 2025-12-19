<?php

namespace App\Http\Services\SeasonalityAnalysisService\Exceptions;

use Exception;

class SeasonalityAnalysisServiceConnectionException extends Exception
{
    public function render($request)
    {
        return response()->json([
            'success' => false,
            'message' => 'Ошибка подключения к сервису анализа сезонности: ' . $this->getMessage()
        ], 503);
    }
}

