<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\GeneticAlgorithm;
use App\Models\AnalysisHistory;

class GeneticAlgorithmStartCommand extends Command
{
    protected $signature = 'genetic-algorithm-start {--threshold=0.5 : Fitness threshold for filtering suppliers}';

    protected $description = 'Start genetic algorithm process';

    public function handle()
    {
        $threshold = (float) $this->option('threshold');

        $history = AnalysisHistory::create([
            'name' => AnalysisHistory::NAME_GENETIC_ALGORITHM,
            'status' => AnalysisHistory::STATUS_IN_PROCESS,
        ]);

        GeneticAlgorithm::dispatch($threshold, $history->id)->onQueue('genetic-algorithm-process');
        $this->info('Genetic algorithm job dispatched with history ID: ' . $history->id);
    }
}
