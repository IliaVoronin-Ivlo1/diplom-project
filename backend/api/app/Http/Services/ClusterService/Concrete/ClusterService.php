<?php

namespace App\Http\Services\ClusterService\Concrete;

use App\Http\Services\ClusterService\Contract\ClusterServiceInterface;
use App\Http\Services\ClusterService\Requests\ClusterRequest;
use App\Models\SupplierCluster;
use Illuminate\Support\Facades\Log;

class ClusterService implements ClusterServiceInterface
{
    private ClusterRequest $clusterRequest;

    public function __construct(ClusterRequest $clusterRequest)
    {
        $this->clusterRequest = $clusterRequest;
    }

    public function startClusterisationRequest(int $historyId): array
    {
        return $this->clusterRequest->sendRequest($historyId);
    }

    public function getClustersData(): array
    {
        try {
            $latestCluster = SupplierCluster::latest()->first();
            
            if (!$latestCluster) {
                Log::info("ClusterService[getClustersData]", ['message' => 'No clusters found']);
                return ['clusters' => []];
            }
            
            $content = $latestCluster->content;
            $clusters = $content['clusters'] ?? [];
            
            return ['clusters' => $clusters];
        } catch (\Exception $e) {
            Log::error("ClusterService[getClustersData]", ['error' => $e->getMessage()]);
            return ['clusters' => []];
        }
    }
}

