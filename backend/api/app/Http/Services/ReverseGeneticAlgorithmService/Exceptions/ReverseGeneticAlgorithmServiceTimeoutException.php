<?php

namespace App\Http\Services\ReverseGeneticAlgorithmService\Exceptions;

use Exception;

class ReverseGeneticAlgorithmServiceTimeoutException extends Exception
{
    public function render($request)
    {
        return response()->json([
            "status" => "false",
            "message" => "Превышено время ожидания ответа от сервиса обратного генетического алгоритма"
        ], 504);
    }
}

