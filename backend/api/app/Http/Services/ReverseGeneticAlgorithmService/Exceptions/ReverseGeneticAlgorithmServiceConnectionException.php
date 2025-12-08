<?php

namespace App\Http\Services\ReverseGeneticAlgorithmService\Exceptions;

use Exception;

class ReverseGeneticAlgorithmServiceConnectionException extends Exception
{
    public function render($request)
    {
        return response()->json([
            "status" => "false",
            "message" => "Ошибка соединения с сервисом обратного генетического алгоритма"
        ], 503);
    }
}

