<?php

namespace App\Http\Services\GeneticAlgorithmService\Requests;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Http\Services\GeneticAlgorithmService\Exceptions\GeneticAlgorithmServiceConnectionException;
use App\Http\Services\GeneticAlgorithmService\Exceptions\GeneticAlgorithmServiceException;
use App\Http\Services\GeneticAlgorithmService\Exceptions\GeneticAlgorithmServiceTimeoutException;

class GeneticAlgorithmRequest
{
    private string $serviceUrl;

    public function __construct(string $serviceUrl)
    {
        $this->serviceUrl = $serviceUrl;
    }

    public function sendRequest(float $fitnessThreshold, int $historyId): array
    {
        try {
            $response = Http::timeout(18000)->get($this->serviceUrl . '/find-best-supplier', [
                'fitness_threshold' => $fitnessThreshold,
                'history_id' => $historyId
            ]);

            if ($response->failed()) {
                Log::info("GeneticAlgorithmRequest[sendRequest]", [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new GeneticAlgorithmServiceException("Сервис вернул ошибку: " . $response->status());
            }

            return $response->json();

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::info("GeneticAlgorithmRequest[sendRequest]", [
                'error' => 'Connection error',
                'message' => $e->getMessage()
            ]);
            throw new GeneticAlgorithmServiceConnectionException($e->getMessage());
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::info("GeneticAlgorithmRequest[sendRequest]", [
                'error' => 'Request error',
                'message' => $e->getMessage()
            ]);
            throw new GeneticAlgorithmServiceException($e->getMessage());
        } catch (\Exception $e) {
            Log::info("GeneticAlgorithmRequest[sendRequest]", [
                'error' => 'Unknown error',
                'message' => $e->getMessage()
            ]);
            throw new GeneticAlgorithmServiceException($e->getMessage());
        }
    }
}

