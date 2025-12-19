<?php

namespace App\Http\Services\SeasonalityAnalysisService\Exceptions;

use Exception;

class SeasonalityAnalysisServiceException extends Exception
{
    public function render($request)
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage()
        ], 500);
    }
}

