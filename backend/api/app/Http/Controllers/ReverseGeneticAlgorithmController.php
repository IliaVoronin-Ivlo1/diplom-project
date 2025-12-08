<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Services\ReverseGeneticAlgorithmService\Contract\ReverseGeneticAlgorithmServiceInterface;
use App\Http\Services\ReverseGeneticAlgorithmService\Exceptions\ReverseGeneticAlgorithmServiceException;
use Illuminate\Support\Facades\Log;

class ReverseGeneticAlgorithmController extends Controller
{
    private ReverseGeneticAlgorithmServiceInterface $reverseGeneticAlgorithmService;

    public function __construct(ReverseGeneticAlgorithmServiceInterface $reverseGeneticAlgorithmService)
    {
        $this->reverseGeneticAlgorithmService = $reverseGeneticAlgorithmService;
    }

    public function getResultsData(Request $request)
    {
        try {
            $result = $this->reverseGeneticAlgorithmService->getReverseGeneticAlgorithmData();
            return response()->json($result);
        } catch (ReverseGeneticAlgorithmServiceException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::info("ReverseGeneticAlgorithmController[getResultsData]", [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                "status" => "false",
                "message" => "Ошибка при получении данных обратного генетического алгоритма: " . $e->getMessage()
            ], 500);
        }
    }

    public function getArticleBrandSuppliers(Request $request, string $article, string $brand)
    {
        try {
            $result = $this->reverseGeneticAlgorithmService->getArticleBrandSuppliers($article, $brand);
            return response()->json($result);
        } catch (ReverseGeneticAlgorithmServiceException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::info("ReverseGeneticAlgorithmController[getArticleBrandSuppliers]", [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                "status" => "false",
                "message" => "Ошибка при получении поставщиков автозапчасти: " . $e->getMessage()
            ], 500);
        }
    }
}

