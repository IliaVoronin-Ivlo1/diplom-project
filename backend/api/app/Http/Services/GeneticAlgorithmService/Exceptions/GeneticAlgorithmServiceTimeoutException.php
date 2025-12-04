<?php

namespace App\Http\Services\GeneticAlgorithmService\Exceptions;

use Exception;

class GeneticAlgorithmServiceTimeoutException extends Exception
{
    public function render($request)
    {
        return response()->json([
            "status" => "false",
            "message" => "Превышено время ожидания ответа от сервиса генетического алгоритма"
        ], 504);
    }
}

