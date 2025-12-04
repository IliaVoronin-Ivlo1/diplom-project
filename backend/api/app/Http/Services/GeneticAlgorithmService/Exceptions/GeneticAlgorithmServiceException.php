<?php

namespace App\Http\Services\GeneticAlgorithmService\Exceptions;

use Exception;

class GeneticAlgorithmServiceException extends Exception
{
    public function render($request)
    {
        return response()->json([
            "status" => "false",
            "message" => "Ошибка сервиса генетического алгоритма"
        ], 500);
    }
}

