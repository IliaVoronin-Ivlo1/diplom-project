<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\AnalysisHistory;
use App\Http\Requests\GetSeasonalityDataRequest;
use App\Http\Requests\GetForecastDataRequest;

class PriceForecastingController extends Controller
{
    public function getArticleBrandList(Request $request)
    {
        try {
            $type = $request->query('type', 'forecasting');
            
            if ($type === 'seasonality') {
                $history = AnalysisHistory::where('name', AnalysisHistory::NAME_SEASONALITY_ANALYSIS)
                    ->where('status', 'SUCCESS')
                    ->latest()
                    ->first();
                
                if (!$history) {
                    return response()->json([
                        'success' => true,
                        'data' => []
                    ]);
                }
                
                $results = DB::table('seasonality_analysis_results')
                    ->where('history_id', $history->id)
                    ->select('article', 'brand')
                    ->distinct()
                    ->orderBy('article')
                    ->orderBy('brand')
                    ->get();
            } else {
                $history = AnalysisHistory::where('name', AnalysisHistory::NAME_PRICE_FORECASTING)
                    ->where('status', 'SUCCESS')
                    ->latest()
                    ->first();
                
                if (!$history) {
                    return response()->json([
                        'success' => true,
                        'data' => []
                    ]);
                }
                
                $results = DB::table('price_forecasting_results')
                    ->where('history_id', $history->id)
                    ->select('article', 'brand')
                    ->distinct()
                    ->orderBy('article')
                    ->orderBy('brand')
                    ->get();
            }
            
            $data = $results->map(function ($item) {
                return [
                    'article' => $item->article,
                    'brand' => $item->brand,
                    'label' => $item->article . '/' . $item->brand
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            Log::error("PriceForecastingController[getArticleBrandList]", [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении списка автозапчастей: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSeasonalityData(GetSeasonalityDataRequest $request)
    {
        try {
            $article = $request->input('article');
            $brand = $request->input('brand');
            
            $history = AnalysisHistory::where('name', AnalysisHistory::NAME_SEASONALITY_ANALYSIS)
                ->where('status', 'SUCCESS')
                ->latest()
                ->first();
            
            if (!$history) {
                return response()->json([
                    'success' => false,
                    'message' => 'Данные анализа сезонности не найдены'
                ], 404);
            }
            
            $result = DB::table('seasonality_analysis_results')
                ->where('history_id', $history->id)
                ->where('article', $article)
                ->where('brand', $brand)
                ->first();
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Данные сезонности для данной автозапчасти не найдены'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'article' => $result->article,
                    'brand' => $result->brand,
                    'monthly_coefficients' => json_decode($result->monthly_coefficients, true),
                    'quarterly_coefficients' => $result->quarterly_coefficients ? json_decode($result->quarterly_coefficients, true) : null,
                    'weekly_coefficients' => $result->weekly_coefficients ? json_decode($result->weekly_coefficients, true) : null,
                    'trend' => json_decode($result->trend, true),
                    'anomalies' => $result->anomalies ? json_decode($result->anomalies, true) : null
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("PriceForecastingController[getSeasonalityData]", [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении данных сезонности: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getForecastData(GetForecastDataRequest $request)
    {
        try {
            $article = $request->input('article');
            $brand = $request->input('brand');
            
            $history = AnalysisHistory::where('name', AnalysisHistory::NAME_PRICE_FORECASTING)
                ->where('status', 'SUCCESS')
                ->latest()
                ->first();
            
            if (!$history) {
                return response()->json([
                    'success' => false,
                    'message' => 'Данные прогнозирования не найдены'
                ], 404);
            }
            
            $result = DB::table('price_forecasting_results')
                ->where('history_id', $history->id)
                ->where('article', $article)
                ->where('brand', $brand)
                ->first();
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Данные прогнозирования для данной автозапчасти не найдены'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'article' => $result->article,
                    'brand' => $result->brand,
                    'forecast_data' => json_decode($result->forecast_data, true),
                    'accuracy_metrics' => $result->accuracy_metrics ? json_decode($result->accuracy_metrics, true) : null,
                    'model_info' => $result->model_info ? json_decode($result->model_info, true) : null
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("PriceForecastingController[getForecastData]", [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении данных прогнозирования: ' . $e->getMessage()
            ], 500);
        }
    }
}

