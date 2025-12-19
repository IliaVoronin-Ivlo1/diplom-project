<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$service = app(\App\Http\Services\GeneticAlgorithmService\Contract\GeneticAlgorithmServiceInterface::class);

$result = $service->getSupplierCombinations(15);

echo "Testing getSupplierCombinations for supplier_id=15\n";
echo "Result keys: " . implode(', ', array_keys($result)) . "\n";

if (isset($result['combinations']) && is_array($result['combinations'])) {
    echo "Combinations count: " . count($result['combinations']) . "\n";
    
    if (count($result['combinations']) > 0) {
        $first = $result['combinations'][0];
        echo "\nFirst combination:\n";
        echo "Article: " . $first['article'] . "\n";
        echo "Brand: " . $first['brand'] . "\n";
        echo "Fitness: " . $first['fitness_score'] . "\n";
        
        if (isset($first['metrics'])) {
            echo "\nMetrics:\n";
            foreach ($first['metrics'] as $key => $value) {
                echo "  $key: " . (is_null($value) ? 'NULL' : $value) . " (type: " . gettype($value) . ")\n";
            }
        } else {
            echo "No metrics found!\n";
        }
    }
} else {
    echo "No combinations found or combinations is null\n";
}

