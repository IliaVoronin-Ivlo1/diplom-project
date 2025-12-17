<?php

namespace App\Http\Services\PriceForecastingService;

use App\Http\Services\PriceForecastingService\Contract\PriceForecastingServiceInterface;
use App\Http\Services\PriceForecastingService\Concrete\PriceForecastingService;
use App\Http\Services\PriceForecastingService\Requests\PriceForecastingRequest;
use Illuminate\Support\ServiceProvider;

class PriceForecastingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PriceForecastingRequest::class, function ($app) {
            $serviceUrl = config('services.price_forecasting_service_url');
            return new PriceForecastingRequest($serviceUrl);
        });

        $this->app->bind(PriceForecastingServiceInterface::class, PriceForecastingService::class);
    }
}

