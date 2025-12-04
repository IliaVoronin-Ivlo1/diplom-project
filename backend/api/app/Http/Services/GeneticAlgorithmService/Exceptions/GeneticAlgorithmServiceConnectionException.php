<?php

namespace App\Http\Services\GeneticAlgorithmService\Exceptions;

use Exception;

class GeneticAlgorithmServiceConnectionException extends Exception
{
    public function render($request)
    {
        return response()->json([
            "status" => "false",
            "message" => "Ошибка соединения с сервисом генетического алгоритма"
        ], 503);
    }
}

