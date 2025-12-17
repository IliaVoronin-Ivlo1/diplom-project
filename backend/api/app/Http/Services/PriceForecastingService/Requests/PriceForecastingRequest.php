<?php

namespace App\Http\Services\PriceForecastingService\Requests;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Http\Services\PriceForecastingService\Exceptions\PriceForecastingServiceConnectionException;
use App\Http\Services\PriceForecastingService\Exceptions\PriceForecastingServiceException;

class PriceForecastingRequest
{
    private string $serviceUrl;

    public function __construct(string $serviceUrl)
    {
        $this->serviceUrl = $serviceUrl;
    }

    public function sendRequest(int $forecastDays, ?int $historyId): array
    {
        try {
            $response = Http::timeout(18000)->get($this->serviceUrl . '/forecast', [
                'history_id' => $historyId,
                'forecast_days' => $forecastDays
            ]);

            if ($response->failed()) {
                Log::error("PriceForecastingRequest[sendRequest]", [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new PriceForecastingServiceException("Сервис вернул ошибку: " . $response->status());
            }

            return $response->json();

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error("PriceForecastingRequest[sendRequest]", [
                'error' => 'Connection error',
                'message' => $e->getMessage()
            ]);
            throw new PriceForecastingServiceConnectionException($e->getMessage());
        } catch (\Exception $e) {
            Log::error("PriceForecastingRequest[sendRequest]", [
                'error' => 'Unknown error',
                'message' => $e->getMessage()
            ]);
            throw new PriceForecastingServiceException($e->getMessage());
        }
    }
}

