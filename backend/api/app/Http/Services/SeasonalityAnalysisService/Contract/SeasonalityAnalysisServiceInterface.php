<?php

namespace App\Http\Services\SeasonalityAnalysisService\Contract;

interface SeasonalityAnalysisServiceInterface
{
    public function startSeasonalityAnalysisRequest(?int $historyId): array;
}

