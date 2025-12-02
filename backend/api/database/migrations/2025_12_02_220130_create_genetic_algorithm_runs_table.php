<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('genetic_algorithm_runs', function (Blueprint $table) {
            $table->id();
            $table->decimal('fitness_threshold', 3, 2);
            $table->decimal('execution_time', 10, 2);
            $table->integer('suppliers_count');
            $table->integer('filtered_suppliers_count');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('genetic_algorithm_runs');
    }
};

