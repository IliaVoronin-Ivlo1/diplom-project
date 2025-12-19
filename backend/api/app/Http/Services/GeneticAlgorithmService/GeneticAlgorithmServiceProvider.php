<?php

namespace App\Http\Services\GeneticAlgorithmService;

use Illuminate\Support\ServiceProvider;
use App\Http\Services\GeneticAlgorithmService\Contract\GeneticAlgorithmServiceInterface;
use App\Http\Services\GeneticAlgorithmService\Concrete\GeneticAlgorithmService;
use App\Http\Services\GeneticAlgorithmService\Requests\GeneticAlgorithmRequest;

class GeneticAlgorithmServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(GeneticAlgorithmRequest::class, function ($app) {
            $serviceUrl = config('services.genetic_algorithm_service_url');
            return new GeneticAlgorithmRequest($serviceUrl);
        });

        $this->app->bind(GeneticAlgorithmServiceInterface::class, GeneticAlgorithmService::class);
    }

    public function boot(): void
    {
        //
    }
}

