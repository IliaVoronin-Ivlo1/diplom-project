<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use App\Http\Services\GeneticAlgorithmService\Contract\GeneticAlgorithmServiceInterface;
use App\Models\AnalysisHistory;

class GeneticAlgorithm implements ShouldQueue
{
    use Queueable;

    private float $fitnessThreshold;
    protected ?int $historyId;

    public function __construct(float $fitnessThreshold = 0.5, ?int $historyId = null)
    {
        $this->fitnessThreshold = $fitnessThreshold;
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
            $geneticAlgorithmService = app(GeneticAlgorithmServiceInterface::class);
            $result = $geneticAlgorithmService->startGeneticAlgorithmRequest($this->fitnessThreshold, $this->historyId);
            Log::info("GeneticAlgorithm[handle]", ['result' => $result]);

            if ($history) {
                $history->status = AnalysisHistory::STATUS_SUCCESS;
                $history->save();
            }
        } catch (\Exception $e) {
            Log::error("GeneticAlgorithm[handle]", [
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
