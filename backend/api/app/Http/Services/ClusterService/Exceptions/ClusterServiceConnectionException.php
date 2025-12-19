<?php

namespace App\Http\Services\ClusterService\Exceptions;

use Exception;

class ClusterServiceConnectionException extends Exception
{
    public function render($request)
    {
        return response()->json([
            "status" => "false",
            "message" => "Ошибка соединения с сервисом кластеризации"
        ], 503);
    }
}

