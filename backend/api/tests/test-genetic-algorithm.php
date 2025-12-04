<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "Testing GeneticAlgorithmResult model...\n";
    
    $result = App\Models\GeneticAlgorithmResult::latest()->first();
    
    if (!$result) {
        echo "No results found\n";
        exit(0);
    }
    
    echo "Found result ID: " . $result->id . "\n";
    
    try {
        $content = $result->content;
        echo "Content type: " . gettype($content) . "\n";
        
        if (is_array($content)) {
            echo "Content is array, keys: " . implode(', ', array_keys($content)) . "\n";
            if (isset($content['results'])) {
                echo "Results key exists\n";
            } else {
                echo "Results key does not exist\n";
            }
        } else {
            echo "Content is not array\n";
        }
    } catch (Exception $e) {
        echo "Error accessing content: " . $e->getMessage() . "\n";
    }
    
    echo "\nTesting service...\n";
    try {
        $service = app(App\Http\Services\GeneticAlgorithmService\Contract\GeneticAlgorithmServiceInterface::class);
        echo "Service created\n";
        $data = $service->getGeneticAlgorithmData();
        echo "Service returned: " . json_encode($data) . "\n";
    } catch (Exception $e) {
        echo "Error in service: " . $e->getMessage() . "\n";
        echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}

