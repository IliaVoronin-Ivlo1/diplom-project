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
        Schema::create('reverse_genetic_algorithm_article_brand_rankings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('run_id')->constrained('reverse_genetic_algorithm_runs')->onDelete('cascade');
            $table->string('article');
            $table->string('brand');
            $table->decimal('fitness_score', 10, 6);
            $table->integer('rank')->nullable();
            $table->decimal('avg_price', 10, 2);
            $table->decimal('success_rate', 5, 2);
            $table->decimal('avg_delivery_time', 10, 2);
            $table->decimal('denial_rate', 5, 2);
            $table->integer('orders_count');
            $table->decimal('total_revenue', 15, 2);
            $table->timestamps();
            
            $table->index('run_id');
            $table->index(['run_id', 'fitness_score']);
            $table->index(['article', 'brand']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reverse_genetic_algorithm_article_brand_rankings');
    }
};
