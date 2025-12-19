<?php

namespace App\Http\Services\PriceForecastingService\Exceptions;

use Exception;

class PriceForecastingServiceException extends Exception
{
    public function render($request)
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage()
        ], 500);
    }
}

