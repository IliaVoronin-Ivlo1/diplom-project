<?php

namespace App\Http\Services\GeneticAlgorithmService\Concrete;

use App\Http\Services\GeneticAlgorithmService\Contract\GeneticAlgorithmServiceInterface;
use App\Http\Services\GeneticAlgorithmService\Requests\GeneticAlgorithmRequest;
use App\Models\GeneticAlgorithmRun;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class GeneticAlgorithmService implements GeneticAlgorithmServiceInterface
{
    private GeneticAlgorithmRequest $geneticAlgorithmRequest;

    public function __construct(GeneticAlgorithmRequest $geneticAlgorithmRequest)
    {
        $this->geneticAlgorithmRequest = $geneticAlgorithmRequest;
    }

    public function startGeneticAlgorithmRequest(float $fitnessThreshold, int $historyId): array
    {
        return $this->geneticAlgorithmRequest->sendRequest($fitnessThreshold, $historyId);
    }

    public function getGeneticAlgorithmData(): array
    {
        try {
            ini_set('memory_limit', '256M');
            
            $latestRun = GeneticAlgorithmRun::latest()->first();
            
            if (!$latestRun) {
                Log::info("GeneticAlgorithmService[getGeneticAlgorithmData]", ['message' => 'No runs found']);
                return ['results' => null];
            }
            
            $allSuppliersRanking = DB::table('genetic_algorithm_supplier_rankings')
                ->where('run_id', $latestRun->id)
                ->orderBy('rank')
                ->limit(10)
                ->select('supplier_id as id', 'service_name', 'name', 'fitness_score', 
                         'avg_price', 'success_rate', 'avg_delivery_time', 'denial_rate', 
                         'orders_count', 'total_revenue')
                ->get()
                ->map(function ($ranking) {
                    return [
                        'id' => $ranking->id,
                        'service_name' => $ranking->service_name,
                        'name' => $ranking->name,
                        'fitness_score' => (float) $ranking->fitness_score,
                        'metrics' => [
                            'avg_price' => (float) $ranking->avg_price,
                            'success_rate' => (float) $ranking->success_rate,
                            'avg_delivery_time' => (float) $ranking->avg_delivery_time,
                            'denial_rate' => (float) $ranking->denial_rate,
                            'orders_count' => (int) $ranking->orders_count,
                            'total_revenue' => (float) $ranking->total_revenue
                        ]
                    ];
                })
                ->toArray();
            
            $supplierRankingIds = DB::table('genetic_algorithm_supplier_rankings')
                ->where('run_id', $latestRun->id)
                ->where('has_combinations', true)
                ->pluck('id')
                ->toArray();
            
            $suppliersWithCombinations = [];
            
            foreach ($supplierRankingIds as $supplierRankingId) {
                $ranking = DB::table('genetic_algorithm_supplier_rankings')
                    ->where('id', $supplierRankingId)
                    ->first();
                
                if (!$ranking) {
                    continue;
                }
                
                $combinations = DB::table('genetic_algorithm_article_brand_rankings')
                    ->where('supplier_ranking_id', $supplierRankingId)
                    ->orderBy('rank')
                    ->limit(20)
                    ->select('article', 'brand', 'fitness_score', 'orders_count', 'success_rate')
                    ->get()
                    ->map(function ($combo) {
                        return [
                            'article' => $combo->article,
                            'brand' => $combo->brand,
                            'fitness_score' => (float) $combo->fitness_score,
                            'metrics' => [
                                'orders_count' => $combo->orders_count,
                                'success_rate' => (float) $combo->success_rate
                            ]
                        ];
                    })
                    ->toArray();
                
                $suppliersWithCombinations[] = [
                    'id' => $ranking->supplier_id,
                    'service_name' => $ranking->service_name,
                    'name' => $ranking->name,
                    'fitness_score' => (float) $ranking->fitness_score,
                    'article_brand_combinations' => $combinations
                ];
            }
            
            $results = [
                'all_suppliers_ranking' => $allSuppliersRanking,
                'suppliers_with_combinations' => $suppliersWithCombinations
            ];
            
            return ['results' => $results];
        } catch (\Throwable $e) {
            Log::error("GeneticAlgorithmService[getGeneticAlgorithmData]", [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'class' => get_class($e)
            ]);
            return ['results' => null];
        }
    }

    public function getSupplierCombinations(int $supplierId): array
    {
        try {
            $latestRun = GeneticAlgorithmRun::latest()->first();
            
            if (!$latestRun) {
                Log::info("GeneticAlgorithmService[getSupplierCombinations]", ['message' => 'No runs found']);
                return ['combinations' => null];
            }
            
            $supplierRanking = DB::table('genetic_algorithm_supplier_rankings')
                ->where('run_id', $latestRun->id)
                ->where('supplier_id', $supplierId)
                ->where('has_combinations', true)
                ->first();
            
            if (!$supplierRanking) {
                Log::info("GeneticAlgorithmService[getSupplierCombinations]", ['message' => 'Supplier not found or has no combinations', 'supplier_id' => $supplierId]);
                return ['combinations' => []];
            }
            
            $combinations = DB::table('genetic_algorithm_article_brand_rankings')
                ->where('supplier_ranking_id', $supplierRanking->id)
                ->orderBy('rank')
                ->limit(20)
                ->select('article', 'brand', 'fitness_score', 'orders_count', 'success_rate', 'avg_price', 'avg_delivery_time', 'total_revenue', 'denial_rate')
                ->get()
                ->map(function ($combo) {
                    return [
                        'article' => $combo->article,
                        'brand' => $combo->brand,
                        'fitness_score' => (float) $combo->fitness_score,
                        'metrics' => [
                            'orders_count' => $combo->orders_count,
                            'success_rate' => (float) $combo->success_rate,
                            'avg_price' => (float) $combo->avg_price,
                            'avg_delivery_time' => (float) $combo->avg_delivery_time,
                            'total_revenue' => (float) $combo->total_revenue,
                            'denial_rate' => (float) $combo->denial_rate
                        ]
                    ];
                })
                ->toArray();
            
            return ['combinations' => $combinations];
        } catch (\Throwable $e) {
            Log::error("GeneticAlgorithmService[getSupplierCombinations]", [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'class' => get_class($e)
            ]);
            return ['combinations' => null];
        }
    }
}

