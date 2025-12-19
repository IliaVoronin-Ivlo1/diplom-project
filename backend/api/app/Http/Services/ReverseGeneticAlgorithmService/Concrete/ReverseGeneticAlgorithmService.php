<?php

namespace App\Http\Services\ReverseGeneticAlgorithmService\Concrete;

use App\Http\Services\ReverseGeneticAlgorithmService\Contract\ReverseGeneticAlgorithmServiceInterface;
use App\Http\Services\ReverseGeneticAlgorithmService\Requests\ReverseGeneticAlgorithmRequest;
use App\Models\ReverseGeneticAlgorithmRun;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ReverseGeneticAlgorithmService implements ReverseGeneticAlgorithmServiceInterface
{
    private ReverseGeneticAlgorithmRequest $reverseGeneticAlgorithmRequest;

    public function __construct(ReverseGeneticAlgorithmRequest $reverseGeneticAlgorithmRequest)
    {
        $this->reverseGeneticAlgorithmRequest = $reverseGeneticAlgorithmRequest;
    }

    public function startReverseGeneticAlgorithmRequest(?int $historyId = null): array
    {
        return $this->reverseGeneticAlgorithmRequest->sendRequest($historyId);
    }

    public function getReverseGeneticAlgorithmData(): array
    {
        try {
            ini_set('memory_limit', '256M');
            
            $latestRun = ReverseGeneticAlgorithmRun::latest()->first();
            
            if (!$latestRun) {
                Log::info("ReverseGeneticAlgorithmService[getReverseGeneticAlgorithmData]", ['message' => 'No runs found']);
                return ['results' => null];
            }
            
            $allArticleBrandsRanking = DB::table('reverse_genetic_algorithm_article_brand_rankings')
                ->where('run_id', $latestRun->id)
                ->orderBy('rank')
                ->limit(20)
                ->select('article', 'brand', 'fitness_score', 'rank',
                         'avg_price', 'success_rate', 'avg_delivery_time', 'denial_rate',
                         'orders_count', 'total_revenue')
                ->get()
                ->map(function ($ranking) {
                    return [
                        'article' => $ranking->article,
                        'brand' => $ranking->brand,
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
            
            $bestArticleBrand = DB::table('reverse_genetic_algorithm_article_brand_rankings')
                ->where('run_id', $latestRun->id)
                ->orderBy('rank')
                ->first();
            
            $bestArticleBrandData = null;
            if ($bestArticleBrand) {
                $bestSuppliers = DB::table('reverse_genetic_algorithm_supplier_rankings')
                    ->where('article_brand_ranking_id', $bestArticleBrand->id)
                    ->orderBy('rank')
                    ->limit(10)
                    ->select('supplier_id', 'service_name', 'supplier_name', 'fitness_score', 'rank',
                             'avg_price', 'success_rate', 'avg_delivery_time', 'denial_rate',
                             'orders_count', 'total_revenue')
                    ->get()
                    ->map(function ($supplier) {
                        return [
                            'supplier_id' => $supplier->supplier_id,
                            'service_name' => $supplier->service_name,
                            'supplier_name' => $supplier->supplier_name,
                            'fitness_score' => (float) $supplier->fitness_score,
                            'metrics' => [
                                'avg_price' => (float) $supplier->avg_price,
                                'success_rate' => (float) $supplier->success_rate,
                                'avg_delivery_time' => (float) $supplier->avg_delivery_time,
                                'denial_rate' => (float) $supplier->denial_rate,
                                'orders_count' => (int) $supplier->orders_count,
                                'total_revenue' => (float) $supplier->total_revenue
                            ]
                        ];
                    })
                    ->toArray();
                
                $bestArticleBrandData = [
                    'article' => $bestArticleBrand->article,
                    'brand' => $bestArticleBrand->brand,
                    'fitness_score' => (float) $bestArticleBrand->fitness_score,
                    'metrics' => [
                        'avg_price' => (float) $bestArticleBrand->avg_price,
                        'success_rate' => (float) $bestArticleBrand->success_rate,
                        'avg_delivery_time' => (float) $bestArticleBrand->avg_delivery_time,
                        'denial_rate' => (float) $bestArticleBrand->denial_rate,
                        'orders_count' => (int) $bestArticleBrand->orders_count,
                        'total_revenue' => (float) $bestArticleBrand->total_revenue
                    ],
                    'suppliers_ranking' => $bestSuppliers
                ];
            }
            
            $articleBrandRankingIds = DB::table('reverse_genetic_algorithm_article_brand_rankings')
                ->where('run_id', $latestRun->id)
                ->limit(20)
                ->pluck('id')
                ->toArray();
            
            $articleBrandsWithSuppliers = [];
            
            foreach ($articleBrandRankingIds as $articleBrandRankingId) {
                $articleBrand = DB::table('reverse_genetic_algorithm_article_brand_rankings')
                    ->where('id', $articleBrandRankingId)
                    ->first();
                
                if (!$articleBrand) {
                    continue;
                }
                
                $suppliers = DB::table('reverse_genetic_algorithm_supplier_rankings')
                    ->where('article_brand_ranking_id', $articleBrandRankingId)
                    ->orderBy('rank')
                    ->limit(10)
                    ->select('supplier_id', 'service_name', 'supplier_name', 'fitness_score', 'rank',
                             'avg_price', 'success_rate', 'avg_delivery_time', 'denial_rate',
                             'orders_count', 'total_revenue')
                    ->get()
                    ->map(function ($supplier) {
                        return [
                            'supplier_id' => $supplier->supplier_id,
                            'service_name' => $supplier->service_name,
                            'supplier_name' => $supplier->supplier_name,
                            'fitness_score' => (float) $supplier->fitness_score,
                            'metrics' => [
                                'avg_price' => (float) $supplier->avg_price,
                                'success_rate' => (float) $supplier->success_rate,
                                'avg_delivery_time' => (float) $supplier->avg_delivery_time,
                                'denial_rate' => (float) $supplier->denial_rate,
                                'orders_count' => (int) $supplier->orders_count,
                                'total_revenue' => (float) $supplier->total_revenue
                            ]
                        ];
                    })
                    ->toArray();
                
                $articleBrandsWithSuppliers[] = [
                    'article' => $articleBrand->article,
                    'brand' => $articleBrand->brand,
                    'fitness_score' => (float) $articleBrand->fitness_score,
                    'metrics' => [
                        'avg_price' => (float) $articleBrand->avg_price,
                        'success_rate' => (float) $articleBrand->success_rate,
                        'avg_delivery_time' => (float) $articleBrand->avg_delivery_time,
                        'denial_rate' => (float) $articleBrand->denial_rate,
                        'orders_count' => (int) $articleBrand->orders_count,
                        'total_revenue' => (float) $articleBrand->total_revenue
                    ],
                    'suppliers_ranking' => $suppliers
                ];
            }
            
            $results = [
                'best_article_brand' => $bestArticleBrandData,
                'all_article_brands_ranking' => $allArticleBrandsRanking,
                'article_brands_with_suppliers' => $articleBrandsWithSuppliers
            ];
            
            return ['results' => $results];
        } catch (\Throwable $e) {
            Log::error("ReverseGeneticAlgorithmService[getReverseGeneticAlgorithmData]", [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'class' => get_class($e)
            ]);
            return ['results' => null];
        }
    }

    public function getArticleBrandSuppliers(string $article, string $brand): array
    {
        try {
            $latestRun = ReverseGeneticAlgorithmRun::latest()->first();
            
            if (!$latestRun) {
                Log::info("ReverseGeneticAlgorithmService[getArticleBrandSuppliers]", ['message' => 'No runs found']);
                return ['suppliers' => []];
            }
            
            $articleBrandRanking = DB::table('reverse_genetic_algorithm_article_brand_rankings')
                ->where('run_id', $latestRun->id)
                ->where('article', $article)
                ->where('brand', $brand)
                ->first();
            
            if (!$articleBrandRanking) {
                Log::info("ReverseGeneticAlgorithmService[getArticleBrandSuppliers]", [
                    'message' => 'Article brand combination not found',
                    'article' => $article,
                    'brand' => $brand
                ]);
                return ['suppliers' => []];
            }
            
            $suppliers = DB::table('reverse_genetic_algorithm_supplier_rankings')
                ->where('article_brand_ranking_id', $articleBrandRanking->id)
                ->orderBy('rank')
                ->limit(10)
                ->select('supplier_id', 'service_name', 'supplier_name', 'fitness_score', 'rank',
                         'avg_price', 'success_rate', 'avg_delivery_time', 'denial_rate',
                         'orders_count', 'total_revenue')
                ->get()
                ->map(function ($supplier) {
                    return [
                        'supplier_id' => $supplier->supplier_id,
                        'service_name' => $supplier->service_name,
                        'supplier_name' => $supplier->supplier_name,
                        'fitness_score' => (float) $supplier->fitness_score,
                        'metrics' => [
                            'avg_price' => (float) $supplier->avg_price,
                            'success_rate' => (float) $supplier->success_rate,
                            'avg_delivery_time' => (float) $supplier->avg_delivery_time,
                            'denial_rate' => (float) $supplier->denial_rate,
                            'orders_count' => (int) $supplier->orders_count,
                            'total_revenue' => (float) $supplier->total_revenue
                        ]
                    ];
                })
                ->toArray();
            
            return ['suppliers' => $suppliers];
        } catch (\Throwable $e) {
            Log::error("ReverseGeneticAlgorithmService[getArticleBrandSuppliers]", [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'class' => get_class($e)
            ]);
            return ['suppliers' => null];
        }
    }
}

