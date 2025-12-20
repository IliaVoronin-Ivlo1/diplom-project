<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use App\Http\Services\PriceForecastingService\Contract\PriceForecastingServiceInterface;
use App\Models\AnalysisHistory;

class PriceForecasting implements ShouldQueue
{
    use Queueable;

    private int $forecastDays;
    protected ?int $historyId;

    public function __construct(int $forecastDays = 30, ?int $historyId = null)
    {
        $this->forecastDays = $forecastDays;
        $this->historyId = $historyId;
    }

    public function handle(): void
    {
        $history = null;
        if ($this->historyId) {
            $history = AnalysisHistory::find($this->historyId);
            if ($history) {
                $history->status = AnalysisHistory::STATUS_IN_PROCESS;
                $history->save();
            }
        }

        try {
            $forecastingService = app(PriceForecastingServiceInterface::class);
            $result = $forecastingService->startPriceForecastingRequest($this->forecastDays, $this->historyId);
            Log::info("PriceForecasting[handle]", ['result' => $result]);
        } catch (\Exception $e) {
            Log::error("PriceForecasting[handle]", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            if ($history) {
                $history->status = AnalysisHistory::STATUS_FAILED;
                $history->save();
            }
            throw $e;
        }
    }
}

