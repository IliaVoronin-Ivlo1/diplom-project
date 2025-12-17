<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\PriceForecasting;
use App\Models\AnalysisHistory;

class PriceForecastingStartCommand extends Command
{
    protected $signature = 'price-forecasting-start {--days=30 : Number of days to forecast}';

    protected $description = 'Start price forecasting process';

    public function handle()
    {
        $days = (int) $this->option('days');

        $history = AnalysisHistory::create([
            'name' => AnalysisHistory::NAME_PRICE_FORECASTING,
            'status' => AnalysisHistory::STATUS_IN_PROCESS,
        ]);

        PriceForecasting::dispatch($days, $history->id)->onQueue('price-forecasting-process');
        $this->info('Price forecasting job dispatched with history ID: ' . $history->id);
    }
}

