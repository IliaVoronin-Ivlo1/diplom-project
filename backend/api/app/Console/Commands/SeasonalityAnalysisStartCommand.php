<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\SeasonalityAnalysis;
use App\Models\AnalysisHistory;

class SeasonalityAnalysisStartCommand extends Command
{
    protected $signature = 'seasonality-analysis-start';

    protected $description = 'Start seasonality analysis process';

    public function handle()
    {
        $history = AnalysisHistory::create([
            'name' => AnalysisHistory::NAME_SEASONALITY_ANALYSIS,
            'status' => AnalysisHistory::STATUS_IN_PROCESS,
        ]);

        SeasonalityAnalysis::dispatch($history->id)->onQueue('seasonality-analysis-process');
        $this->info('Seasonality analysis job dispatched with history ID: ' . $history->id);
    }
}

