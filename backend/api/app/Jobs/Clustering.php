<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use App\Http\Services\ClusterService\Contract\ClusterServiceInterface;
use App\Models\AnalysisHistory;

class Clustering implements ShouldQueue
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
            $clusterService = app(ClusterServiceInterface::class);
            $result = $clusterService->startClusterisationRequest($this->historyId);
            Log::info("Clustering[handle]", ['result' => $result]);

            if ($history) {
                $history->status = AnalysisHistory::STATUS_SUCCESS;
                $history->save();
            }
        } catch (\Exception $e) {
            Log::error("Clustering[handle]", [
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
