<?php

namespace App\Http\Services\ReverseGeneticAlgorithmService\Contract;

interface ReverseGeneticAlgorithmServiceInterface
{
    public function startReverseGeneticAlgorithmRequest(?int $historyId = null): array;
    public function getReverseGeneticAlgorithmData(): array;
    public function getArticleBrandSuppliers(string $article, string $brand): array;
}

