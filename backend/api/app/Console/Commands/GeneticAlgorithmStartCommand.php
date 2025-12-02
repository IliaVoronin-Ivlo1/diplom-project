<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\GeneticAlgorithm;

class GeneticAlgorithmStartCommand extends Command
{
    protected $signature = 'genetic-algorithm-start {--threshold=0.5 : Fitness threshold for filtering suppliers}';

    protected $description = 'Start genetic algorithm process';

    public function handle()
    {
        $threshold = (float) $this->option('threshold');
        GeneticAlgorithm::dispatch($threshold)->onQueue('genetic-algorithm-process');
        $this->info('Genetic algorithm job dispatched');
    }
}
