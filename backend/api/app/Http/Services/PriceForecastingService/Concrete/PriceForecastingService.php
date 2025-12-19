<?php

namespace App\Http\Services\PriceForecastingService\Concrete;

use App\Http\Services\PriceForecastingService\Contract\PriceForecastingServiceInterface;
use App\Http\Services\PriceForecastingService\Requests\PriceForecastingRequest;
use Illuminate\Support\Facades\Log;

class PriceForecastingService implements PriceForecastingServiceInterface
{
    private PriceForecastingRequest $forecastingRequest;

    public function __construct(PriceForecastingRequest $forecastingRequest)
    {
        $this->forecastingRequest = $forecastingRequest;
    }

    public function startPriceForecastingRequest(int $forecastDays, ?int $historyId): array
    {
        return $this->forecastingRequest->sendRequest($forecastDays, $historyId);
    }
}

