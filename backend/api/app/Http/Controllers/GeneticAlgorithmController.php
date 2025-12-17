<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Services\GeneticAlgorithmService\Contract\GeneticAlgorithmServiceInterface;
use App\Http\Services\GeneticAlgorithmService\Exceptions\GeneticAlgorithmServiceException;

class GeneticAlgorithmController extends Controller
{
    private GeneticAlgorithmServiceInterface $geneticAlgorithmService;

    public function __construct(GeneticAlgorithmServiceInterface $geneticAlgorithmService)
    {
        $this->geneticAlgorithmService = $geneticAlgorithmService;
    }

    public function getResultsData(Request $request)
    {
        try {
            $result = $this->geneticAlgorithmService->getGeneticAlgorithmData();
            return response()->json($result);
        } catch (GeneticAlgorithmServiceException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::error("GeneticAlgorithmController[getResultsData]", [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                "success" => false,
                "message" => "Ошибка при получении данных генетического алгоритма: " . $e->getMessage()
            ], 500);
        }
    }

    public function getSupplierCombinations(Request $request, int $supplierId)
    {
        try {
            $result = $this->geneticAlgorithmService->getSupplierCombinations($supplierId);
            return response()->json($result);
        } catch (GeneticAlgorithmServiceException $e) {
            return $e->render($request);
        } catch (\Exception $e) {
            Log::error("GeneticAlgorithmController[getSupplierCombinations]", [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                "success" => false,
                "message" => "Ошибка при получении комбинаций поставщика: " . $e->getMessage()
            ], 500);
        }
    }
}
