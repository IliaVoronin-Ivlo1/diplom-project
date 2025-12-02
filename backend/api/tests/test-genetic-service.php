<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing DB query...\n";
$result = DB::table('genetic_algorithm_results')->orderBy('created_at', 'desc')->first();

if (!$result) {
    echo "No results found\n";
    exit(0);
}

echo "Found result ID: " . $result->id . "\n";
echo "Content type: " . gettype($result->content) . "\n";

if (is_string($result->content)) {
    echo "Content length: " . strlen($result->content) . "\n";
    echo "Memory usage before decode: " . memory_get_usage(true) / 1024 / 1024 . " MB\n";
    
    try {
        $content = json_decode($result->content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo "JSON decode error: " . json_last_error_msg() . "\n";
            exit(1);
        }
        echo "Content decoded successfully\n";
        echo "Memory usage after decode: " . memory_get_usage(true) / 1024 / 1024 . " MB\n";
        
        if (is_array($content)) {
            echo "Content keys: " . implode(', ', array_keys($content)) . "\n";
            if (isset($content['results'])) {
                echo "Results key exists\n";
                echo "Results type: " . gettype($content['results']) . "\n";
                if (is_array($content['results'])) {
                    echo "Results is array with keys: " . implode(', ', array_keys($content['results'])) . "\n";
                }
            }
        }
    } catch (Exception $e) {
        echo "Exception during decode: " . $e->getMessage() . "\n";
        exit(1);
    }
} else {
    echo "Content is not string, type: " . gettype($result->content) . "\n";
}

echo "\nTesting service...\n";
try {
    $service = app(App\Http\Services\GeneticAlgorithmService\Contract\GeneticAlgorithmServiceInterface::class);
    echo "Service created successfully\n";
    
    $data = $service->getGeneticAlgorithmData();
    echo "Service returned data\n";
    echo "Result keys: " . implode(', ', array_keys($data)) . "\n";
    echo "Results type: " . gettype($data['results']) . "\n";
    
    if ($data['results'] !== null) {
        echo "Results is not null\n";
        if (is_array($data['results'])) {
            echo "Results is array\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error in service: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}

echo "\nTest completed successfully\n";

