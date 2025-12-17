<?php

namespace App\Http\Services\ReverseGeneticAlgorithmService;

use Illuminate\Support\ServiceProvider;
use App\Http\Services\ReverseGeneticAlgorithmService\Contract\ReverseGeneticAlgorithmServiceInterface;
use App\Http\Services\ReverseGeneticAlgorithmService\Concrete\ReverseGeneticAlgorithmService;
use App\Http\Services\ReverseGeneticAlgorithmService\Requests\ReverseGeneticAlgorithmRequest;

class ReverseGeneticAlgorithmServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ReverseGeneticAlgorithmRequest::class, function ($app) {
            $serviceUrl = config('services.reverse_genetic_algorithm_service_url');
            return new ReverseGeneticAlgorithmRequest($serviceUrl);
        });

        $this->app->bind(ReverseGeneticAlgorithmServiceInterface::class, ReverseGeneticAlgorithmService::class);
    }

    public function boot(): void
    {
        //
    }
}

