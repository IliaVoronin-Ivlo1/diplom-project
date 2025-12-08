<?php

namespace App\Http\Services\GeneticAlgorithmService\Contract;

interface GeneticAlgorithmServiceInterface
{
    public function startGeneticAlgorithmRequest(float $fitnessThreshold, int $historyId): array;
    public function getGeneticAlgorithmData(): array;
    public function getSupplierCombinations(int $supplierId): array;
}

