<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use App\Http\Services\ClusterService\Contract\ClusterServiceInterface;

class Clustering implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function handle(): void
    {
        try {
            $clusterService = app(ClusterServiceInterface::class);
            $result = $clusterService->startClusterisationRequest();
            Log::info("Clustering[handle]", ['result' => $result]);
        } catch (\Exception $e) {
            Log::info("Clustering[handle]", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}
