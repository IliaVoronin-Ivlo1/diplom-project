<?php

namespace App\Http\Services\ReverseGeneticAlgorithmService\Requests;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Http\Services\ReverseGeneticAlgorithmService\Exceptions\ReverseGeneticAlgorithmServiceConnectionException;
use App\Http\Services\ReverseGeneticAlgorithmService\Exceptions\ReverseGeneticAlgorithmServiceException;
use App\Http\Services\ReverseGeneticAlgorithmService\Exceptions\ReverseGeneticAlgorithmServiceTimeoutException;

class ReverseGeneticAlgorithmRequest
{
    private string $serviceUrl;

    public function __construct(string $serviceUrl)
    {
        $this->serviceUrl = $serviceUrl;
    }

    public function sendRequest(?int $historyId = null): array
    {
        try {
            $queryParams = [];
            if ($historyId !== null) {
                $queryParams['history_id'] = $historyId;
            }

            $response = Http::timeout(18000)->get($this->serviceUrl . '/find-best-article-brands', $queryParams);

            if ($response->failed()) {
                Log::info("ReverseGeneticAlgorithmRequest[sendRequest]", [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new ReverseGeneticAlgorithmServiceException("Сервис вернул ошибку: " . $response->status());
            }

            return $response->json();

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::info("ReverseGeneticAlgorithmRequest[sendRequest]", [
                'error' => 'Connection error',
                'message' => $e->getMessage()
            ]);
            throw new ReverseGeneticAlgorithmServiceConnectionException($e->getMessage());
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::info("ReverseGeneticAlgorithmRequest[sendRequest]", [
                'error' => 'Request error',
                'message' => $e->getMessage()
            ]);
            throw new ReverseGeneticAlgorithmServiceException($e->getMessage());
        } catch (\Exception $e) {
            Log::info("ReverseGeneticAlgorithmRequest[sendRequest]", [
                'error' => 'Unknown error',
                'message' => $e->getMessage()
            ]);
            throw new ReverseGeneticAlgorithmServiceException($e->getMessage());
        }
    }
}

