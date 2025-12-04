<?php

namespace App\Http\Services\GeneticAlgorithmService\Contract;

interface GeneticAlgorithmServiceInterface
{
    public function startGeneticAlgorithmRequest(float $fitnessThreshold = 0.5): array;
    public function getGeneticAlgorithmData(): array;
    public function getSupplierCombinations(int $supplierId): array;
}

