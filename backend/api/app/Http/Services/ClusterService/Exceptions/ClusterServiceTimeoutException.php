<?php

namespace App\Http\Services\ClusterService\Exceptions;

use Exception;

class ClusterServiceTimeoutException extends Exception
{
    public function render($request)
    {
        return response()->json([
            "status" => "false",
            "message" => "Превышено время ожидания ответа от сервиса кластеризации"
        ], 504);
    }
}

