<?php

namespace App\Http\Services\ClusterService\Contract;

interface ClusterServiceInterface
{
    public function startClusterisationRequest(int $historyId): array;
    public function getClustersData(): array;
}

