<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "Testing endpoint via controller...\n";

try {
    $controller = app(App\Http\Controllers\GeneticAlgorithmController::class);
    $request = new Illuminate\Http\Request();
    
    $response = $controller->getResultsData($request);
    
    echo "Response status: " . $response->getStatusCode() . "\n";
    
    $data = json_decode($response->getContent(), true);
    
    if (isset($data['results'])) {
        echo "Results found\n";
        if (isset($data['results']['all_suppliers_ranking'])) {
            echo "all_suppliers_ranking count: " . count($data['results']['all_suppliers_ranking']) . "\n";
        }
        if (isset($data['results']['suppliers_with_combinations'])) {
            echo "suppliers_with_combinations count: " . count($data['results']['suppliers_with_combinations']) . "\n";
            if (count($data['results']['suppliers_with_combinations']) > 0) {
                $first = $data['results']['suppliers_with_combinations'][0];
                echo "First supplier has " . count($first['article_brand_combinations'] ?? []) . " combinations\n";
            }
        }
    } else {
        echo "No results in response\n";
        echo "Response: " . substr($response->getContent(), 0, 500) . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    exit(1);
}

echo "\nTest completed\n";

