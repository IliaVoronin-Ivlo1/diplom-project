<?php

namespace App\Http\Services\ReverseGeneticAlgorithmService\Exceptions;

use Exception;

class ReverseGeneticAlgorithmServiceException extends Exception
{
    public function render($request)
    {
        return response()->json([
            "success" => false,
            "message" => "Ошибка сервиса обратного генетического алгоритма"
        ], 500);
    }
}

