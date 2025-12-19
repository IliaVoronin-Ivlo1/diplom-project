<?php

namespace App\Http\Services\SeasonalityAnalysisService\Concrete;

use App\Http\Services\SeasonalityAnalysisService\Contract\SeasonalityAnalysisServiceInterface;
use App\Http\Services\SeasonalityAnalysisService\Requests\SeasonalityAnalysisRequest;
use Illuminate\Support\Facades\Log;

class SeasonalityAnalysisService implements SeasonalityAnalysisServiceInterface
{
    private SeasonalityAnalysisRequest $seasonalityRequest;

    public function __construct(SeasonalityAnalysisRequest $seasonalityRequest)
    {
        $this->seasonalityRequest = $seasonalityRequest;
    }

    public function startSeasonalityAnalysisRequest(?int $historyId): array
    {
        return $this->seasonalityRequest->sendRequest($historyId);
    }
}

