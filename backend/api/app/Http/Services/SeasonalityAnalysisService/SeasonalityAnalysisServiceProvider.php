<?php

namespace App\Http\Services\SeasonalityAnalysisService;

use App\Http\Services\SeasonalityAnalysisService\Contract\SeasonalityAnalysisServiceInterface;
use App\Http\Services\SeasonalityAnalysisService\Concrete\SeasonalityAnalysisService;
use App\Http\Services\SeasonalityAnalysisService\Requests\SeasonalityAnalysisRequest;
use Illuminate\Support\ServiceProvider;

class SeasonalityAnalysisServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(SeasonalityAnalysisRequest::class, function ($app) {
            $serviceUrl = config('services.seasonality_analysis_service_url');
            return new SeasonalityAnalysisRequest($serviceUrl);
        });

        $this->app->bind(SeasonalityAnalysisServiceInterface::class, SeasonalityAnalysisService::class);
    }
}

