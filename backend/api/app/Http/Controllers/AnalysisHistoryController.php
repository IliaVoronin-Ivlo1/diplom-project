<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\AnalysisHistory;
use App\Http\Requests\GetAnalysisHistoryRequest;
use Carbon\Carbon;

class AnalysisHistoryController extends Controller
{
    private function getAlgorithmNameMapping(): array
    {
        return [
            AnalysisHistory::NAME_CLUSTERIZATION => 'Кластеризация',
            AnalysisHistory::NAME_GENETIC_ALGORITHM => 'Рейтинг поставщиков',
            AnalysisHistory::NAME_REVERSE_GENETIC_ALGORITHM => 'Рейтинг автозапчастей',
            AnalysisHistory::NAME_SEASONALITY_ANALYSIS => 'Анализ сезонности',
            AnalysisHistory::NAME_PRICE_FORECASTING => 'Прогнозирование цен',
        ];
    }

    private function getStatusMapping(): array
    {
        return [
            AnalysisHistory::STATUS_IN_PROCESS => 'В процессе',
            AnalysisHistory::STATUS_SUCCESS => 'Успешно',
            AnalysisHistory::STATUS_FAILED => 'Ошибка',
        ];
    }

    public function getHistory(GetAnalysisHistoryRequest $request)
    {
        try {
            $date = $request->input('date');
            $page = $request->input('page', 1);
            $status = $request->input('status');
            $algorithmName = $request->input('algorithm_name');
            $perPage = 10;
            
            if ($date) {
                $dateCarbon = Carbon::parse($date);
                $startOfDay = $dateCarbon->copy()->startOfDay();
                $endOfDay = $dateCarbon->copy()->endOfDay();
            } else {
                $startOfDay = Carbon::today()->startOfDay();
                $endOfDay = Carbon::today()->endOfDay();
            }

            $historyQuery = AnalysisHistory::whereBetween('created_at', [$startOfDay, $endOfDay]);
            
            if ($status) {
                $historyQuery->where('status', $status);
            }
            
            if ($algorithmName) {
                $historyQuery->where('name', $algorithmName);
            }
            
            $historyQuery->orderBy('created_at', 'desc');
            
            $total = $historyQuery->count();
            $history = $historyQuery->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get();

            $nameMapping = $this->getAlgorithmNameMapping();
            $statusMapping = $this->getStatusMapping();

            $data = $history->map(function ($item) use ($nameMapping, $statusMapping) {
                $duration = null;
                if ($item->updated_at && $item->created_at) {
                    $createdAt = $item->created_at instanceof Carbon ? $item->created_at : Carbon::parse($item->created_at);
                    $updatedAt = $item->updated_at instanceof Carbon ? $item->updated_at : Carbon::parse($item->updated_at);
                    
                    $durationSeconds = abs($createdAt->diffInSeconds($updatedAt));
                    
                    $hours = floor($durationSeconds / 3600);
                    $minutes = floor(($durationSeconds % 3600) / 60);
                    $seconds = $durationSeconds % 60;
                    
                    if ($hours > 0) {
                        $duration = sprintf('%d ч %d мин %d сек', $hours, $minutes, $seconds);
                    } elseif ($minutes > 0) {
                        $duration = sprintf('%d мин %d сек', $minutes, $seconds);
                    } else {
                        $duration = sprintf('%d сек', $seconds);
                    }
                } elseif ($item->status === AnalysisHistory::STATUS_IN_PROCESS) {
                    $now = Carbon::now();
                    $createdAt = $item->created_at instanceof Carbon ? $item->created_at : Carbon::parse($item->created_at);
                    $durationSeconds = $createdAt->diffInSeconds($now);
                    $hours = floor($durationSeconds / 3600);
                    $minutes = floor(($durationSeconds % 3600) / 60);
                    $seconds = $durationSeconds % 60;
                    
                    if ($hours > 0) {
                        $duration = sprintf('%d ч %d мин %d сек (в процессе)', $hours, $minutes, $seconds);
                    } elseif ($minutes > 0) {
                        $duration = sprintf('%d мин %d сек (в процессе)', $minutes, $seconds);
                    } else {
                        $duration = sprintf('%d сек (в процессе)', $seconds);
                    }
                }

                return [
                    'id' => $item->id,
                    'algorithm_name' => $nameMapping[$item->name] ?? $item->name,
                    'algorithm_code' => $item->name,
                    'status' => $statusMapping[$item->status] ?? $item->status,
                    'status_code' => $item->status,
                    'started_at' => $item->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $item->updated_at ? $item->updated_at->format('Y-m-d H:i:s') : null,
                    'duration' => $duration,
                ];
            });

            $totalPages = ceil($total / $perPage);

            return response()->json([
                'success' => true,
                'data' => $data,
                'pagination' => [
                    'current_page' => (int)$page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'total_pages' => $totalPages,
                    'has_next_page' => $page < $totalPages,
                    'has_prev_page' => $page > 1
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error('AnalysisHistoryController[getHistory]', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ошибка сервера при получении истории алгоритмов'
            ], 500);
        }
    }
}

