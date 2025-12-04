<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing SQL query with JSONB extraction...\n";

try {
    $result = DB::selectOne("
        SELECT content->'results' as results
        FROM genetic_algorithm_results
        ORDER BY created_at DESC
        LIMIT 1
    ");
    
    if (!$result) {
        echo "No results found\n";
        exit(0);
    }
    
    echo "Query executed successfully\n";
    echo "Results type: " . gettype($result->results) . "\n";
    
    if (is_string($result->results)) {
        echo "Results is string, length: " . strlen($result->results) . "\n";
        $decoded = json_decode($result->results, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo "JSON decode error: " . json_last_error_msg() . "\n";
        } else {
            echo "JSON decoded successfully\n";
            if (is_array($decoded)) {
                echo "Decoded is array with keys: " . implode(', ', array_keys($decoded)) . "\n";
            }
        }
    } else {
        echo "Results is not string\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    exit(1);
}

echo "\nTest completed\n";

