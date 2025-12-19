<?php

namespace App\Http\Controllers;

use App\Models\AlgorithmSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AlgorithmScheduleController extends Controller
{
    public function getSchedules(Request $request)
    {
        try {
            $schedules = AlgorithmSchedule::all();

            $result = [
                'clustering' => ['hours' => 6, 'minutes' => 1],
                'genetic_algorithm' => ['hours' => 6, 'minutes' => 1],
                'reverse_genetic_algorithm' => ['hours' => 6, 'minutes' => 1],
                'seasonality_analysis' => ['hours' => 6, 'minutes' => 1]
            ];

            foreach ($schedules as $schedule) {
                $result[$schedule->algorithm_type] = [
                    'hours' => $schedule->schedule_hours,
                    'minutes' => $schedule->schedule_minutes ?? 1
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $result
            ], 200);
        } catch (\Exception $e) {
            Log::error('AlgorithmScheduleController[getSchedules]', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Ошибка сервера при получении настроек алгоритмов'
            ], 500);
        }
    }

    public function updateSchedule(Request $request, string $algorithmType)
    {
        try {
            $request->validate([
                'schedule_hours' => 'required|integer|min:1',
                'schedule_minutes' => 'required|integer|min:1|max:59'
            ]);

            $schedule = AlgorithmSchedule::updateOrCreate(
                ['algorithm_type' => $algorithmType],
                [
                    'schedule_hours' => $request->schedule_hours,
                    'schedule_minutes' => $request->schedule_minutes
                ]
            );

            return response()->json([
                'success' => true,
                'data' => $schedule
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('AlgorithmScheduleController[updateSchedule]', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Ошибка сервера при обновлении настройки алгоритма'
            ], 500);
        }
    }
}
