<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\Clustering;
use App\Models\AnalysisHistory;

class ClusteringStartCommand extends Command
{
    protected $signature = 'clustering-start';

    protected $description = 'Start clustering process';

    public function handle()
    {
        $history = AnalysisHistory::create([
            'name' => AnalysisHistory::NAME_CLUSTERIZATION,
            'status' => AnalysisHistory::STATUS_IN_PROCESS,
        ]);

        Clustering::dispatch($history->id)->onQueue('clusterisation-proccess');
        $this->info('Clustering job dispatched with history ID: ' . $history->id);
    }
}
