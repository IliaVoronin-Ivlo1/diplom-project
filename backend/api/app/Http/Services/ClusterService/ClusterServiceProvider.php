<?php

namespace App\Http\Services\ClusterService;

use Illuminate\Support\ServiceProvider;
use App\Http\Services\ClusterService\Contract\ClusterServiceInterface;
use App\Http\Services\ClusterService\Concrete\ClusterService;
use App\Http\Services\ClusterService\Requests\ClusterRequest;

class ClusterServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ClusterRequest::class, function ($app) {
            $serviceUrl = config('services.clustering_service_url');
            return new ClusterRequest($serviceUrl);
        });

        $this->app->bind(ClusterServiceInterface::class, ClusterService::class);
    }

    public function boot(): void
    {
        //
    }
}

