<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\Clustering;

class ClusteringStartCommand extends Command
{
    protected $signature = 'clustering-start';

    protected $description = 'Start clustering process';

    public function handle()
    {
        Clustering::dispatch()->onQueue('clusterisation-proccess');
        $this->info('Clustering job dispatched');
    }
}
