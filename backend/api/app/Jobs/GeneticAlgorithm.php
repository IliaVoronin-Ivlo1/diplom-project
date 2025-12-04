<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use App\Http\Services\GeneticAlgorithmService\Contract\GeneticAlgorithmServiceInterface;

class GeneticAlgorithm implements ShouldQueue
{
    use Queueable;

    private float $fitnessThreshold;

    public function __construct(float $fitnessThreshold = 0.5)
    {
        $this->fitnessThreshold = $fitnessThreshold;
    }

    public function handle(): void
    {
        try {
            $geneticAlgorithmService = app(GeneticAlgorithmServiceInterface::class);
            $result = $geneticAlgorithmService->startGeneticAlgorithmRequest($this->fitnessThreshold);
            Log::info("GeneticAlgorithm[handle]", ['result' => $result]);
        } catch (\Exception $e) {
            Log::info("GeneticAlgorithm[handle]", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}
