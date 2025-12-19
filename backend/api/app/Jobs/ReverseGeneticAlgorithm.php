<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use App\Http\Services\ReverseGeneticAlgorithmService\Contract\ReverseGeneticAlgorithmServiceInterface;
use App\Models\AnalysisHistory;

class ReverseGeneticAlgorithm implements ShouldQueue
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
            $reverseGeneticAlgorithmService = app(ReverseGeneticAlgorithmServiceInterface::class);
            $result = $reverseGeneticAlgorithmService->startReverseGeneticAlgorithmRequest($this->historyId);
            Log::info("ReverseGeneticAlgorithm[handle]", ['result' => $result]);

            if ($history) {
                $history->status = AnalysisHistory::STATUS_SUCCESS;
                $history->save();
            }
        } catch (\Exception $e) {
            Log::error("ReverseGeneticAlgorithm[handle]", [
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

