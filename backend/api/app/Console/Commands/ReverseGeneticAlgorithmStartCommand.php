<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\ReverseGeneticAlgorithm;
use App\Models\AnalysisHistory;

class ReverseGeneticAlgorithmStartCommand extends Command
{
    protected $signature = 'reverse-genetic-algorithm-start';

    protected $description = 'Start reverse genetic algorithm process';

    public function handle()
    {
        $history = AnalysisHistory::create([
            'name' => AnalysisHistory::NAME_REVERSE_GENETIC_ALGORITHM,
            'status' => AnalysisHistory::STATUS_IN_PROCESS,
        ]);

        ReverseGeneticAlgorithm::dispatch($history->id)->onQueue('reverse-genetic-algorithm-process');
        $this->info('Reverse genetic algorithm job dispatched with history ID: ' . $history->id);
    }
}

