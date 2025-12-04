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
            $serviceUrl = env('CLUSTERING_SERVICE_URL', 'http://diplom_clustering_service:8005');
            return new ClusterRequest($serviceUrl);
        });

        $this->app->bind(ClusterServiceInterface::class, ClusterService::class);
    }

    public function boot(): void
    {
        //
    }
}

