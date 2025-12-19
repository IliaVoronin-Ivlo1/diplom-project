<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('genetic_algorithm_supplier_rankings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('run_id')->constrained('genetic_algorithm_runs')->onDelete('cascade');
            $table->integer('supplier_id');
            $table->string('service_name');
            $table->text('name');
            $table->decimal('fitness_score', 10, 6);
            $table->boolean('has_combinations')->default(false);
            $table->integer('rank')->nullable();
            $table->timestamps();
            
            $table->index('run_id');
            $table->index('supplier_id');
            $table->index(['run_id', 'fitness_score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('genetic_algorithm_supplier_rankings');
    }
};
