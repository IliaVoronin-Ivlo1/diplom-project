<?php

namespace App\Http\Services\ClusterService\Requests;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Http\Services\ClusterService\Exceptions\ClusterServiceConnectionException;
use App\Http\Services\ClusterService\Exceptions\ClusterServiceException;
use App\Http\Services\ClusterService\Exceptions\ClusterServiceTimeoutException;

class ClusterRequest
{
    private string $serviceUrl;

    public function __construct(string $serviceUrl)
    {
        $this->serviceUrl = $serviceUrl;
    }

    public function sendRequest(): array
    {
        try {
            $response = Http::timeout(18000)->get($this->serviceUrl . '/cluster');

            if ($response->failed()) {
                Log::info("ClusterRequest[sendRequest]", [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new ClusterServiceException("Сервис вернул ошибку: " . $response->status());
            }

            return $response->json();

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::info("ClusterRequest[sendRequest]", [
                'error' => 'Connection error',
                'message' => $e->getMessage()
            ]);
            throw new ClusterServiceConnectionException($e->getMessage());
        } catch (\Illuminate\Http\Client\RequestException $e) {
            Log::info("ClusterRequest[sendRequest]", [
                'error' => 'Request error',
                'message' => $e->getMessage()
            ]);
            throw new ClusterServiceException($e->getMessage());
        } catch (\Exception $e) {
            Log::info("ClusterRequest[sendRequest]", [
                'error' => 'Unknown error',
                'message' => $e->getMessage()
            ]);
            throw new ClusterServiceException($e->getMessage());
        }
    }
}

