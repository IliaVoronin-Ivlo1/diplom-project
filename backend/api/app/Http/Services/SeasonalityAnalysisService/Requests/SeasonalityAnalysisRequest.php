<?php

namespace App\Http\Services\SeasonalityAnalysisService\Requests;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Http\Services\SeasonalityAnalysisService\Exceptions\SeasonalityAnalysisServiceConnectionException;
use App\Http\Services\SeasonalityAnalysisService\Exceptions\SeasonalityAnalysisServiceException;

class SeasonalityAnalysisRequest
{
    private string $serviceUrl;

    public function __construct(string $serviceUrl)
    {
        $this->serviceUrl = $serviceUrl;
    }

    public function sendRequest(?int $historyId): array
    {
        try {
            $response = Http::timeout(18000)->get($this->serviceUrl . '/analyze', [
                'history_id' => $historyId
            ]);

            if ($response->failed()) {
                Log::error("SeasonalityAnalysisRequest[sendRequest]", [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new SeasonalityAnalysisServiceException("Сервис вернул ошибку: " . $response->status());
            }

            return $response->json();

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error("SeasonalityAnalysisRequest[sendRequest]", [
                'error' => 'Connection error',
                'message' => $e->getMessage()
            ]);
            throw new SeasonalityAnalysisServiceConnectionException($e->getMessage());
        } catch (\Exception $e) {
            Log::error("SeasonalityAnalysisRequest[sendRequest]", [
                'error' => 'Unknown error',
                'message' => $e->getMessage()
            ]);
            throw new SeasonalityAnalysisServiceException($e->getMessage());
        }
    }
}

