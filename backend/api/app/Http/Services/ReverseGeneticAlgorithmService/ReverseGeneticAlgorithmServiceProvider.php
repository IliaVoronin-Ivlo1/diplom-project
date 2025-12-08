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
            $serviceUrl = env('REVERSE_GENETIC_ALGORITHM_SERVICE_URL', 'http://diplom_reverse_genetic_algorithm_service:8007');
            return new ReverseGeneticAlgorithmRequest($serviceUrl);
        });

        $this->app->bind(ReverseGeneticAlgorithmServiceInterface::class, ReverseGeneticAlgorithmService::class);
    }

    public function boot(): void
    {
        //
    }
}

