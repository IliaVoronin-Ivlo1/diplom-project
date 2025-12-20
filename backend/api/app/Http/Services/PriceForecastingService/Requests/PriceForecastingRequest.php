<?php

namespace App\Http\Services\PriceForecastingService\Requests;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Http\Services\PriceForecastingService\Exceptions\PriceForecastingServiceConnectionException;
use App\Http\Services\PriceForecastingService\Exceptions\PriceForecastingServiceException;
use Illuminate\Http\Client\ConnectionException;

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
            $response = Http::timeout(86400)->get($this->serviceUrl . '/forecast', [
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

        } catch (ConnectionException $e) {
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

