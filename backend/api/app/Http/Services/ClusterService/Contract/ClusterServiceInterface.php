<?php

namespace App\Http\Services\ClusterService\Contract;

interface ClusterServiceInterface
{
    public function startClusterisationRequest(): array;
}

