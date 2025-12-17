<?php

namespace App\Http\Services\PriceForecastingService\Contract;

interface PriceForecastingServiceInterface
{
    public function startPriceForecastingRequest(int $forecastDays, ?int $historyId): array;
}

