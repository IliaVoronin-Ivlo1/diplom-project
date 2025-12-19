<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Http\Services\ClusterService\ClusterServiceProvider::class,
    App\Http\Services\GeneticAlgorithmService\GeneticAlgorithmServiceProvider::class,
    App\Http\Services\ReverseGeneticAlgorithmService\ReverseGeneticAlgorithmServiceProvider::class,
    App\Http\Services\SeasonalityAnalysisService\SeasonalityAnalysisServiceProvider::class,
    App\Http\Services\PriceForecastingService\PriceForecastingServiceProvider::class,
];
