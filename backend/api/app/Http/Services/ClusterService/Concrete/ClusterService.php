<?php

namespace App\Http\Services\ClusterService\Concrete;

use App\Http\Services\ClusterService\Contract\ClusterServiceInterface;
use App\Http\Services\ClusterService\Requests\ClusterRequest;

class ClusterService implements ClusterServiceInterface
{
    private ClusterRequest $clusterRequest;

    public function __construct(ClusterRequest $clusterRequest)
    {
        $this->clusterRequest = $clusterRequest;
    }

    public function startClusterisationRequest(): array
    {
        return $this->clusterRequest->sendRequest();
    }
}

