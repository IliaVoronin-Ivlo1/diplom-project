<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing service directly...\n";

try {
    $service = app(App\Http\Services\GeneticAlgorithmService\Contract\GeneticAlgorithmServiceInterface::class);
    echo "Service created successfully\n";
    
    $data = $service->getGeneticAlgorithmData();
    echo "Service returned data\n";
    echo "Result keys: " . implode(', ', array_keys($data)) . "\n";
    
    if ($data['results'] !== null) {
        echo "Results is not null\n";
        if (is_array($data['results'])) {
            echo "Results is array with keys: " . implode(', ', array_keys($data['results'])) . "\n";
            if (isset($data['results']['all_suppliers_ranking'])) {
                echo "all_suppliers_ranking exists, type: " . gettype($data['results']['all_suppliers_ranking']) . "\n";
                if (is_array($data['results']['all_suppliers_ranking'])) {
                    echo "all_suppliers_ranking is array with " . count($data['results']['all_suppliers_ranking']) . " elements\n";
                }
            }
            if (isset($data['results']['suppliers_with_combinations'])) {
                echo "suppliers_with_combinations exists, type: " . gettype($data['results']['suppliers_with_combinations']) . "\n";
                if (is_array($data['results']['suppliers_with_combinations'])) {
                    echo "suppliers_with_combinations is array with " . count($data['results']['suppliers_with_combinations']) . " elements\n";
                }
            }
        }
    } else {
        echo "Results is null\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    exit(1);
}

echo "\nTest completed successfully\n";

