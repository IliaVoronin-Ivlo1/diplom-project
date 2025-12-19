<?php

namespace App\Http\Services\ClusterService\Exceptions;

use Exception;

class ClusterServiceException extends Exception
{
    public function render($request)
    {
        return response()->json([
            "success" => false,
            "message" => "Ошибка сервиса кластеризации"
        ], 500);
    }
}

