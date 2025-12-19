<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use App\Http\Services\SeasonalityAnalysisService\Contract\SeasonalityAnalysisServiceInterface;
use App\Models\AnalysisHistory;

class SeasonalityAnalysis implements ShouldQueue
{
    use Queueable;

    protected ?int $historyId;

    public function __construct(?int $historyId = null)
    {
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
            $seasonalityService = app(SeasonalityAnalysisServiceInterface::class);
            $result = $seasonalityService->startSeasonalityAnalysisRequest($this->historyId);
            Log::info("SeasonalityAnalysis[handle]", ['result' => $result]);

            if ($history) {
                $history->status = AnalysisHistory::STATUS_SUCCESS;
                $history->save();
            }
        } catch (\Exception $e) {
            Log::error("SeasonalityAnalysis[handle]", [
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

